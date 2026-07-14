import Cashflow from "../models/Cashflow.js";
import Shift from "../models/Shift.js";

export const createCashflow = async (req, res) => {
    const { flow_type, amount, reason } = req.body;

    const shift = await Shift.findOne({
        cashier_id: req.user._id,
        status: 'active',
    });
    if (!shift) {
        return res.status(409).json({ message: 'Tidak ada shift aktif. Buka shift dulu.' });
    }

    const entry = await Cashflow.create({
        shift_id: shift._id,
        cashier_id: req.user._id,      
        flow_type,
        amount,
        reason,
    });

    const field = flow_type === 'cash_in' ? 'total_cash_in' : 'total_cash_out';
    await Shift.updateOne({ _id: shift._id }, { $inc: { [field]: amount } });

    res.status(201).json({ message: 'Catatan kas berhasil dibuat', data: entry });
};

export const getCashflow = async (req, res) => {
    const shift = await Shift.findOne({
        cashier_id: req.user._id,
        status: 'active',
    });
    if (!shift) {
        return res.status(409).json({ message: 'Tidak ada shift aktif.' });
    }

    const entries = await Cashflow.find({ shift_id: shift._id }).sort({ created_at: -1 });
    res.json({ data: entries });
};
