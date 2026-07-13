import mongoose from 'mongoose';

const recipeItemSchema = new mongoose.Schema(
    {
        ingredient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true},
        quantity_required: {type: Number, required: true, min: 0}
    },
    {_id: false}
);

const modifierSchema = new mongoose.Schema(
    {
        group_id: {type: mongoose.Schema.Types.ObjectId, ref: 'ModifierGroup', required: true},
        modifier_name: {type: String, required: true, trim: true},
        extra_price: {type: Number, min: 0, default: 0},
        recipe: [recipeItemSchema],
        is_available: {type: Boolean, default: true},
        is_deleted: {type: Boolean, default: false},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
);

export default mongoose.model('Modifier', modifierSchema);