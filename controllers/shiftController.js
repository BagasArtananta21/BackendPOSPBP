import Shift from '../models/Shift.js';

export const getActiveShift = async (req, res) => {
    const existingShift = await Shift.findOne({cashier_id: req.user._id, status: 'active'})
    res.json({ message: 'Shift berhasil diambil', data: existingShift });
}

export const startShift = async (req, res) => {
    const {starting_cash} = req.body;
    const existingShift = await Shift.findOne({cashier_id: req.user._id, status: 'active'});
    if (existingShift) {
        return res.status(400).json({ message: 'Shift sudah aktif, tidak bisa memulai shift baru' });
    }

    const shift = await Shift.create({
        cashier_id: req.user._id,
        starting_cash,
    });
    res.json({ message: 'Shift berhasil dimulai', data: shift });
}

export const endShift = async (req, res) => {
    const {actual_cash} = req.body;
    const existingShift = await Shift.findOne({cashier_id: req.user._id, status: 'active'});
    if (!existingShift) {
        return res.status(400).json({ message: 'Tidak ada shift aktif untuk dikakhiri' });
    }

    const expected_cash = 
        existingShift.starting_cash + 
        existingShift.total_cash_in + 
        existingShift.total_cash_sales - 
        existingShift.total_cash_out;
    
    existingShift.actual_cash = actual_cash;
    existingShift.expected_cash = expected_cash;
    existingShift.variance = actual_cash - expected_cash;
    existingShift.end_time = new Date();
    existingShift.status = 'closed';

    await existingShift.save();
    res.json({ message: 'Shift berhasil diakhiri', data: existingShift });
}