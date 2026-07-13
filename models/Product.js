import mongoose from "mongoose";
import Ingredient from "./Ingredient.js";

const productSchema = new mongoose.Schema(
    {
        product_name: {type: String, required: true, trim: true},
        category: {type: String, enum: ['coffee', 'non_coffee', 'pastry', 'others'], required: true, trim: true},
        price: {type: Number, required: true, min: 0},
        image_url: {type: String, trim: true},
        recipe: [{
            ingredient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true},
            quantity_required: {type: Number, min: 0, required: true},
        }],
        modifier_groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'ModifierGroup', default: []}],
        is_available: {type: Boolean, default: true},
        is_deleted: {type: Boolean, default: false},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
);