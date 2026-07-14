import mongoose from "mongoose";

const cashflowSchema = new mongoose.Schema(
    {
        shift_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true},
        cashier_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        flow_type: {type: String, enum: ['cash_in', 'cash_out'], required: true},
        amount: {type: Number, required: true, min: 1},
        reason: {type: String, trim: true, required: true},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
)

export default mongoose.model('Cashflow', cashflowSchema);