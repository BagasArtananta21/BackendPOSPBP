import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
    {
        supplier_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null},
        ingredient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true},
        quantity_changed: {type: Number, required: true},
        batch_number: {type: String, trim: true},
        cost_per_unit: {type: Number, required: true, min: 0},
        adjustment_type: 
            {type: String, 
            enum: ['supply_in', 'damaged', 'expired', 'stock_opname', 'sales_deduction', 'void_return' ], 
            required: true},
        reference_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null},
        recorded_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
);

export default mongoose.model('Stock', stockSchema);
 