import mongoose from "mongoose";

const selectedModifierSchema = new mongoose.Schema(
    {
        modifier_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Modifier', required: true},
        modifier_name: {type: String, required: true, trim: true},
        extra_price: {type: Number, required: true, min: 0},
    },
    {_id: false}
);

const transactionDetailSchema = new mongoose.Schema(
    {
        transaction_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true},
        product_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        product_name: {type: String, required: true, trim: true},
        quantity: {type: Number, required: true, min: 1},
        unit_price: {type: Number, required: true, min: 0},
        selected_modifiers: [selectedModifierSchema],
        subtotal: {type: Number, required: true, min: 0},
        snapshot_cogs: {type: Number, required: true, min: 0}
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
)

export default mongoose.model ('TransactionDetail', transactionDetailSchema);