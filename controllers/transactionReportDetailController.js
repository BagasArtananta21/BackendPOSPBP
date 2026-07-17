import Transaction from "../models/Transaction.js";
import TransactionDetail from "../models/TransactionDetail.js";

const buildDateMatch = (req) => {
    const match = {status: 'success'};
    if(req.query.from_date || req.query.to_date){
        match.created_at = {};
        if (req.query.from_date){
            const f = new Date(req.query.from_date); 
            f.setHours(0, 0, 0, 0);
            match.created_at.$gte = f;
        }
        if (req.query.to_date){
            const t = new Date(req.query.to_date); 
            t.setHours(23, 59, 59, 999);
            match.created_at.$lte = t;
        }
    }
    return match;
}

export const getSalesSummary = async (req, res) => {
    const match = buildDateMatch(req);
    const[txn] = await Transaction.aggregate([
        {$match: match},
        {$group: {
            _id: null,
            gross: {$sum: '$total_amount'},
            subtotal: {$sum: '$subtotal'},
            tax: {$sum: '$tax_amount'},
            count: {$sum: 1},
            avg: {$avg: '$total_amount'},
        }},
    ]);
    
    const lookupMatch = {};
    for (const [k, v] of Object.entries(match)) lookupMatch[`txn.${k}`] = v;   
    
    const [cog] = await TransactionDetail.aggregate([
        {$lookup: {from: 'transactions', localField: 'transaction_id', foreignField: '_id', as: 'txn'}},
        {$unwind: '$txn'},
        {$match: lookupMatch},
        {$group: {
            _id: null,
            total_cogs: {$sum: '$snapshot_cogs'},
        }},
    ]);

    const gross = txn?.gross || 0;
    const subtotal = txn?.subtotal || 0;
    const total_cogs = cog?.total_cogs || 0;

    res.json({ data: {
        gross_revenue: gross,
        net_revenue: subtotal - total_cogs,
        tax_total: txn?.tax || 0,
        transaction_count: txn?.count || 0,
        average_transaction: Math.round(txn?.avg || 0),
    }});
}

export const getTopSalesProducts = async (req, res) => {
    const match = buildDateMatch(req);
    const lookupMatch = {};
    for (const [k, v] of Object.entries(match)) lookupMatch[`txn.${k}`] = v;

    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const top = await TransactionDetail.aggregate([
        {$lookup: {from: 'transactions', localField: 'transaction_id', foreignField: '_id', as: 'txn'}},
        {$unwind: '$txn'},
        {$match: lookupMatch},
        {$group: {
            _id: {product_id: '$product_id'},
            product_name: {$first: '$product_name'},
            total_quantity: {$sum: '$quantity'},
            total_sales: {$sum: '$subtotal'},
        }},
        {$sort: {total_quantity: -1}},
        {$limit: limit},
    ]);

    res.json({ data: top });
}

export const getSalesTrend = async (req, res) => {
    const match = buildDateMatch(req);

    const unit = ['day', 'week', 'month'].includes(req.query.granularity) ? req.query.granularity : 'day';
    const trend = await Transaction.aggregate([
        {$match: match},
        {$group: {
            _id: {$dateTrunc: {date: '$created_at', unit: unit, timezone: 'Asia/Jakarta'}},
            total_sales: {$sum: '$total_amount'},
            count: {$sum: 1},
        }},
        {$sort: {_id: 1}},
    ]);
    res.json({granularity: unit, data: trend});
}

export const getTransactionList = async (req, res) => {
    const match = {};

    if (req.query.from_date || req.query.to_date) {
        match.created_at = {};
        if (req.query.from_date) { 
            const f = new Date(req.query.from_date); 
            f.setHours(0, 0, 0, 0);      
            match.created_at.$gte = f; 
        }
        if (req.query.to_date) { 
            const t = new Date(req.query.to_date);   
            t.setHours(23, 59, 59, 999); 
            match.created_at.$lte = t; 
        }
    }

    if (req.query.status) match.status = req.query.status;                
    if (req.query.payment_method) match.payment_method = req.query.payment_method; 

    const transactions = await Transaction.find(match)
        .populate('cashier_id', 'name')   
        .sort({ created_at: -1 });        

    res.json({ count: transactions.length, data: transactions });
};
