import mongoose from "mongoose";

const modifierGroupSchema = new mongoose.Schema(
  {
    group_name: { type: String, required: true, trim: true },
    selection_type: { type: String, enum: ['single', 'multiple'], required: true },
    is_required: { type: Boolean, default: false },
    max_select: { type: Number, default: 1, min: 1 },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('ModifierGroup', modifierGroupSchema);
