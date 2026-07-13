import mongoose from "mongoose";

const recipeItemSchema = new mongoose.Schema(
    {
        ingredient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true},
        quantity_required: {type: Number, required: true, min: 0}
    },
    {_id: false}
)

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['coffee', 'non-coffee', 'pastry', 'others'], required: true },
    price: { type: Number, required: true, min: 0 },
    image_url: { type: String, trim: true },
    recipe: [recipeItemSchema],
    modifier_groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ModifierGroup' }],
    is_available: { type: Boolean, default: true },   // toggle manual admin
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export default mongoose.model('Product', productSchema);

