import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        supplier_name: {type: String, required: true, trim: true},
        contact_person: {type: String, required: true, trim: true},
        phone: {type: String, required: true, trim: true},
        email: {type: String, required: true, trim: true, unique: true},
        address: {type: String, required: true, trim: true},
    },
    {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} }
);

export default mongoose.model('Supplier', supplierSchema);