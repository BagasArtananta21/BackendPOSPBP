import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
    {
        ingredient_name: {type: String, required: true, trim: true},
        sku: {type: String, required: true, trim: true, unique: true},
        current_stock: {type: Number, required: true, default: 0, min: 0},
        minimum_stock: {type: Number, required: true, default: 0, min: 0},
        last_cost_per_unit: {type: Number, required: true, default: 0, min: 0},
        unit: {type: String, enum: ['gr', 'ml', 'pcs'], required: true},
        is_deleted: {type: Boolean, default: false},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
);

export default mongoose.model('Ingredient', ingredientSchema);