import Shift from "../models/Shift.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const getStaffReport = async (req, res) => {
    const txnMatch = {};
    const shiftMatch = {};

    if (req.query.from_date || req.query.to_date) {
        const dateFilter = {};

        if (req.query.from_date) {
            const f = new Date(req.query.from_date); 
            f.setHours(0, 0, 0, 0);
            dateFilter.$gte = f;
        }
        if (req.query.to_date) {
            const t = new Date(req.query.to_date); 
            t.setHours(23, 59, 59, 999);
            dateFilter.$lte = t;
        }
        txnMatch.created_at = dateFilter;
        shiftMatch.start_time = dateFilter;
    };
    const txnStats = await Transaction.aggregate([
        { $match: txnMatch },
        {$group: {
            _id: '$cashier_id',
            total_sales:  { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$total_amount', 0] } },
            transaction_count: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
            voided_count: { $sum: { $cond: [{ $eq: ['$status', 'voided'] }, 1, 0] } },
        }},
    ]);

    const shiftStats = await Shift.aggregate([
        { $match: shiftMatch },
        {$group: {
            _id: '$cashier_id',
            shift_count: { $sum: 1 },
            total_variance: { $sum: '$variance' },
            total_work_ms: {
                $sum: {
                    $cond: [
                        {$ne: ['$end_time', null]},
                        {$subtract: ['$end_time', '$start_time']},
                        0,
                    ]
                }
            }
        }},
    ]);

    const map = new Map();
    const blank = (id) => ({ cashier_id: id, total_sales: 0, transaction_count: 0, voided_count: 0, shift_count: 0, total_variance: 0, total_work_ms: 0 });

    for (const t of txnStats){
        const row = blank(t._id);
        row.total_sales = t.total_sales;
        row.transaction_count = t.transaction_count;
        row.voided_count = t.voided_count;
        map.set(t._id.toString(), row);
    }

    for (const s of shiftStats){
        const key = s._id.toString();
        const row = map.get(key) || blank(s._id);
        row.shift_count = s.shift_count;
        row.total_variance = s.total_variance;
        row.total_work_ms = s.total_work_ms;
        map.set(key, row);
    }

    const rows = [...map.values()];
    const users = await User.find({_id: {$in: rows.map(r => r.cashier_id)}}).select('name');
    const nameMap = new Map(users.map(u => [u._id.toString(), u.name]));

    const data = rows.map(r => {
        const totalMinutes = Math.floor(r.total_work_ms / 60000);   
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const { total_work_ms, ...rest } = r;                       
        return {
            ...rest,
            name: nameMap.get(r.cashier_id.toString()) || 'Unknown',
            total_work_minutes: totalMinutes,          
            total_work_display: `${hours}j ${minutes}m`,   
        };
    });
    res.json({ message: 'Laporan karyawan berhasil diambil', data });
}

export const getStaffShiftDetails = async (req, res) => {
    const { cashier_id } = req.params;

    const user = await User.findById(cashier_id).select('name');
    if (!user) {
        return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }

    const shifts = await Shift.find({cashier_id}).sort({start_time: -1});
    
    const data = shifts.map(s => {
        const durationMs = s.end_time ? (s.end_time - s.start_time) : null;

        let duration_minutes = null;
        let duration_display = 'Sedang Melakukan Shift';
        if (durationMs !== null) {
            duration_minutes = Math.floor(durationMs / 60000);
            const h = Math.floor(duration_minutes / 60);
            const m = duration_minutes % 60;
            duration_display = `${h}j ${m}m`;
        }

        return {
            shifts_id: s._id,
            status: s.status,
            start_time: s.start_time,
            end_time: s.end_time,
            duration_minutes,
            duration_display,
            total_cash_sales: s.total_cash_sales,
            total_qris_sales: s.total_qris_sales,
            variance: s.variance,
        };
    });

    res.json({ 
        message: 'Detail shift karyawan berhasil diambil', 
        cashier: { _id: user._id, name: user.name},
        data,
    });
}
