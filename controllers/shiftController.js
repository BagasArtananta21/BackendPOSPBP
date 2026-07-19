import Shift from "../models/Shift.js";
import Transaction from "../models/Transaction.js";

export const getActiveShift = async (req, res) => {
    const existingShift = await Shift.findOne({ cashier_id: req.user._id, status: 'active' });
    res.json({ message: 'Shift berhasil diambil', data: existingShift });
};

export const startShift = async (req, res) => {
    const { starting_cash } = req.body;
    const existingShift = await Shift.findOne({ cashier_id: req.user._id, status: 'active' });

    if (existingShift) {
        return res.status(400).json({ message: 'Shift sudah aktif, tidak bisa memulai shift baru' });
    }

    const shift = await Shift.create({
        cashier_id: req.user._id,
        starting_cash,
    });

    res.json({ message: 'Shift berhasil dimulai', data: shift });
};

export const getShiftSummary = async (req, res) => {
    const shift = await Shift.findOne({
        cashier_id: req.user._id,
        status: "active"
    });

    if (!shift) {
        return res.status(400).json({
            message: "Tidak ada shift aktif."
        });
    }

    const cashSales = shift.total_cash_sales || 0;

    const expectedCash =
        shift.starting_cash +
        cashSales +
        shift.total_cash_in -
        shift.total_cash_out;

    const baseDuration = 6;
    const extended = shift.extended_hours || 0;
    const SHIFT_DURATION = 6 * 60 * 60 * 1000;
    const endTime = new Date(shift.start_time.getTime() + SHIFT_DURATION);
    const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000));

    res.json({
        message: "Ringkasan shift",
        data: {
            shift,
            starting_cash: shift.starting_cash,
            cash_sales: cashSales,
            cash_in: shift.total_cash_in,
            cash_out: shift.total_cash_out,
            expected_cash: expectedCash,
            remaining_seconds: remainingSeconds
        }
    });
};

export const extendShift = async (req, res) => {
    const shift = await Shift.findOne({ cashier_id: req.user._id, status: 'active' });

    if (!shift) {
        return res.status(400).json({ message: 'Tidak ada shift aktif.' });
    }

    shift.extended_hours = (shift.extended_hours || 0) + 6;
    await shift.save();

    res.json({ message: 'Shift diperpanjang 6 jam', data: shift });
};

export const endShift = async (req, res) => {
    const { actual_cash } = req.body;
    const existingShift = await Shift.findOne({ cashier_id: req.user._id, status: 'active' });

    if (!existingShift) {
        return res.status(400).json({ message: 'Tidak ada shift aktif untuk dikakhiri' });
    }

    const cashSales = existingShift.total_cash_sales || 0;

    const expected_cash =
        existingShift.starting_cash +
        existingShift.total_cash_in +
        cashSales -
        existingShift.total_cash_out;

    const variance = actual_cash - expected_cash;

    existingShift.actual_cash = actual_cash;
    existingShift.variance = variance;
    existingShift.end_time = new Date();
    existingShift.status = 'closed';

    await existingShift.save();

    res.json({
        message: "Shift berhasil diakhiri",
        data: {
            shift: existingShift,
            cash_sales: cashSales,
            expected_cash: expected_cash,
            variance: variance
        }
    });
};