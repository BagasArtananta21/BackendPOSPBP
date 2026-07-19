import Transaction from "../models/Transaction.js";
import TransactionDetail from "../models/TransactionDetail.js";
import Counter from "../models/Counter.js";
import Product from "../models/Product.js";
import Modifier from "../models/Modifier.js";
import Ingredient from "../models/Ingredient.js";
import Stock from "../models/Stock.js";
import Shift from "../models/Shift.js";
import QRCode from "qrcode";

const taxRate = 0.11;

const generateInvoiceNumber = async (sequenceName) => {
    const counter = await Counter.findOneAndUpdate(
        {_id: 'invoice'},
        {$inc: {seq: 1}},
        {returnDocument: 'after', upsert: true}
    );
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const seq = String(counter.seq).padStart(4, '0');
    return `INV-${year}${month}${day}-${seq}`;
}

export const createTransaction = async (req, res) => {
    const {items, payment_method} = req.body;

    if(!Array.isArray(items) || items.length === 0){
        return res.status(400).json({ message: 'Items tidak boleh kosong' });
    }

    const shift = await Shift.findOne({cashier_id: req.user._id, status: 'active',});
    if (!shift) {
        return res.status(400).json({ message: 'Tidak ada shift aktif. Buka shift dulu.' });
    }

    const needMap = new Map();
    const detailDraft = [];
    let subtotal_all = 0;

    for (const item of items){
        const {product_id, quantity, modifiers = [], note = ""} = item;

        if (!Number.isInteger(quantity) || quantity <= 0){
            return res.status(400).json({ message: 'Quantity harus bilangan bulat positif' });
        }
        const product = await Product.findOne({_id: product_id, is_deleted: false})
            .populate('recipe.ingredient_id')
        if(!product) {
            return res.status(404).json({ message: `Produk dengan id ${product_id} tidak ditemukan` });
        }
        if (!product.is_available){
            return res.status(400).json({ message: `Produk ${product.product_name} tidak tersedia` });
        }

        const chosenModifiers = modifiers.length
            ? await Modifier.find({ _id: { $in: modifiers}, is_deleted: false })
            .populate('recipe.ingredient_id')
            : [];
        
        let unit_price = product.price;
        for (const mod of chosenModifiers) unit_price += mod.extra_price;

        const subtotal = unit_price * quantity;
        subtotal_all += subtotal;

        let cogs_per_unit = 0;
        const accumulate = (recipe) => {
            for (const r of recipe){
                const ing = r.ingredient_id;
                cogs_per_unit += r.quantity_required * (ing.last_cost_per_unit || 0);

                const key = ing._id.toString();
                const needed = r.quantity_required * quantity;
                const prev = needMap.get(key);
                if (prev) prev.needed += needed;
                else needMap.set(key, {ingredient: ing, needed});
            }
        };
        accumulate(product.recipe);
        for (const mod of chosenModifiers) accumulate(mod.recipe);

        detailDraft.push({
            product_id: product._id,
            product_name: product.product_name,
            quantity,
            unit_price,
            selected_modifiers: chosenModifiers.map(m => ({
                modifier_id: m._id,
                modifier_name: m.modifier_name,
                extra_price: m.extra_price
            })),
            subtotal,
            snapshot_cogs: cogs_per_unit * quantity,
            note,
        });
    }

    const insufficient = [];
    for (const {ingredient, needed} of needMap.values()){
        if (ingredient.current_stock < needed){
            insufficient.push({
                ingredient: ingredient.ingredient_name,
                needed,
                available: ingredient.current_stock,
            });
        }
    }
    if (insufficient.length){
        return res.status(400).json({message: 'Stok bahan tidak cukup', detail: insufficient});
    }

    const invoice_number = await generateInvoiceNumber();

    const tax_amount = Math.round(subtotal_all * taxRate);
    const total_amount = subtotal_all + tax_amount;
    const isQris = payment_method === 'qris';

    const transaction = await Transaction.create({
        invoice_number,
        cashier_id: req.user._id,
        shift_id: shift._id,
        payment_method,
        subtotal: subtotal_all,
        tax_rate: taxRate,
        tax_amount,
        total_amount,
        status: isQris ? 'pending' : 'success',
    });

    const details = await TransactionDetail.insertMany(
        detailDraft.map(d => ({ ...d, transaction_id: transaction._id}))
    );

    for (const {ingredient, needed} of needMap.values()){
        await Stock.create({
            ingredient_id: ingredient._id,
            quantity_changed: -needed,
            cost_per_unit: ingredient.last_cost_per_unit || 0,
            adjustment_type: 'sales_deduction',
            reference_id: transaction._id,
            recorded_by: req.user._id,
        });
        await Ingredient.updateOne({_id: ingredient._id}, {$inc: {current_stock: -needed} })
    }

    if (!isQris){
        await Shift.updateOne({ _id: shift._id }, { $inc: { total_cash_sales: total_amount } });
    }

    res.json({ message: 'Transaksi berhasil dicatat', data: { transaction, details } });
}


export const getTransactions = async (req, res) => {
    const filter = { cashier_id: req.user._id };   

    if (req.query.invoice_number) {
        filter.invoice_number = { $regex: req.query.invoice_number, $options: 'i' };
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const transactions = await Transaction.find(filter).sort({ created_at: -1 });
    res.json({ data: transactions });
};

export const getTransactionById = async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    const details = await TransactionDetail.find({ transaction_id: transaction._id });
    res.json({ data: { transaction, details } });
};

export const voidTransaction = async (req, res) => {
    const {void_reason} = req.body;
    if (!void_reason){
        return res.status(400).json({ message: 'Alasan void harus diisi' });
    }

    const shift = await Shift.findOne({cashier_id: req.user._id, status: 'active',});
    if (!shift){
        return res.status(400).json({ message: 'Anda tidak memiliki shift yang aktif' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    if (transaction.status === 'voided') {
        return res.status(400).json({ message: 'Transaksi sudah di-void' });
    }
    if (!transaction.shift_id.equals(shift._id)){
        return res.status(400).json({ message: 'Transaksi ini tidak termasuk shift Anda' });
    }

    const saleEntries = await Stock.find({
        reference_id: transaction._id,
        adjustment_type: 'sales_deduction'
    });
    for (const entry of saleEntries){
        const reverseStock = -entry.quantity_changed;
        await Stock.create({
            ingredient_id: entry.ingredient_id,
            quantity_changed: reverseStock,
            cost_per_unit: entry.cost_per_unit,
            adjustment_type: 'void_return',
            reference_id: transaction._id,
            recorded_by: req.user._id,
        });
        await Ingredient.updateOne({_id: entry.ingredient_id}, {$inc: {current_stock: reverseStock}});
    }

    if (transaction.status === 'success') {
        const salesField = transaction.payment_method === 'cash' ? 'total_cash_sales' : 'total_qris_sales';
        await Shift.updateOne({ _id: shift._id }, { $inc: { [salesField]: -transaction.total_amount } });
    }

    transaction.status = 'voided';
    transaction.voided_by = req.user._id;
    transaction.voided_at = new Date();
    transaction.void_reason = void_reason;
    await transaction.save();

    res.json({ message: 'Transaksi berhasil di-void', data: transaction });
}

export const getTransactionQris = async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    if (transaction.payment_method !== 'qris') {
        return res.status(400).json({ message: 'Transaksi ini bukan pembayaran QRIS' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const payUrl = `${baseUrl}/pay/${transaction._id}`;      
    const qr_image = await QRCode.toDataURL(payUrl, { width: 400, margin: 1 });

    res.json({
        message: 'QRIS berhasil dibuat',
        data: {
            invoice_number: transaction.invoice_number,
            total_amount: transaction.total_amount,
            status: transaction.status,
            pay_url: payUrl,
            qr_image,
        },
    });
};
