import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        invoice_number: {type: String, required: true, unique: true},
        cashier_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        shift_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true},
        payment_method: {type: String, enum: ['cash', 'qris'], required: true},
        subtotal: {type: Number, required: true, min: 0},          
        tax_rate: {type: Number, required: true, min: 0, default: 0.11},  
        tax_amount: {type: Number, required: true, min: 0},          
        total_amount: {type: Number, required: true, min: 0},          

        status: {type: String, enum: ['pending' ,'success', 'voided'], default: 'success'},

        voided_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
        voided_at: {type: Date, default: null},
        void_reason: {type: String, trim: true, default: null}
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
)

export default mongoose.model('Transaction', transactionSchema);