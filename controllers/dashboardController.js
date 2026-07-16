import Ingredient from "../models/Ingredient.js";
import TransactionDetail from "../models/TransactionDetail.js";
import Transaction from "../models/Transaction.js";
import Shift from "../models/Shift.js";
import { set } from "mongoose";

export const getTodayRange = () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return { start, end };
}

export const getDailySummary = async (req, res) => {
    const { start, end } = getTodayRange();

    const [txn] = await Transaction.aggregate([
        {$match: {status: 'success', created_at: {$gte: start, $lte: end}}},
        {$group: {_id: null, gross: {$sum: '$total_amount'}, subtotal: {$sum: '$subtotal'}, count: {$sum: 1}}},
    ]);

    const [cogRow] = await TransactionDetail.aggregate([
        {$lookup: {from: "transactions", localField: 'transaction_id', foreignField: '_id', as: 'txn'}},
        {$unwind: '$txn'},
        {$match: {'txn.status': 'success', 'txn.created_at': {$gte: start, $lte: end}}},
        {$group: {_id: null, total_cogs: {$sum: '$snapshot_cogs'}}}
    ]);

    const gross = txn?.gross || 0;
    const subtotal = txn?.subtotal || 0;
    const count = txn?.count || 0;
    const total_cogs = cogRow?.total_cogs || 0;

    res.json({ data: {
        gross_revenue: gross,
        net_revenue: subtotal - total_cogs,
        transaction_count: count,
    }});
}

export const getLowStock = async (req, res) => {
    const items = await Ingredient.find({ is_deleted: false, $expr: { $lte: ['$current_stock', '$minimum_stock'] }})
    .sort({ ingredient_name: 1 });
    res.json({ count: items.length, data: items });
}

export const getActiveCashiers = async (req, res) => {
    const cashier = await Shift.find({ status: 'active' })
        .populate('cashier_id', 'name')
        .sort({ created_at: -1 });
    res.json({ count: cashier.length, data: cashier });
}

export const getRecentTransactions = async (req, res) => {
    const transactions = await Transaction.find()
        .populate('cashier_id', 'name')
        .sort({ created_at: -1 })
        .limit(10);
    res.json({ data: transactions });
}

export const getSalesTrend = async (req, res) => {
    const { start, end } = getTodayRange();

    const trend = await Transaction.aggregate([
        {$match: {status: 'success', created_at: {$gte: start, $lte: end}}},
        {$group: {
            _id: {$hour: {date: '$created_at', timezone: 'Asia/Jakarta'}},
            total_sales: {$sum: '$total_amount'},
        }}
    ]);
    res.json({ data: trend });
}
