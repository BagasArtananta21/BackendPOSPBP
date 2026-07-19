import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
    {
        cashier_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        starting_cash: {type: Number, required: true, min: 0 },
        total_cash_sales: {type: Number, required: true, min: 0, default: 0 },
        total_qris_sales: {type: Number, required: true, min: 0, default: 0 },
        total_cash_in: {type: Number, required: true, min: 0, default: 0 },
        total_cash_out: {type: Number, required: true, min: 0, default: 0 },
        expected_cash: {type: Number, min: 0, default: null },
        actual_cash: {type: Number, min: 0, default: null },
        variance: {type: Number, default: null},
        start_time: {type: Date, required: true, default: Date.now},
        end_time: {type: Date, default: null},
            extended_hours: { type: Number, default: 0 },
        status: {type: String, enum: ['active', 'closed'], required: true, default: 'active'}
    },
)

export default mongoose.model('Shift', shiftSchema);