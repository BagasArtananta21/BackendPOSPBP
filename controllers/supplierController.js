import Supplier from "../models/Supplier.js";

export const createSuppliers = async (req, res) => {
    const {supplier_name, contact_person, phone, email, address} = req.body;
    const supplier = await Supplier.create({
        supplier_name,
        contact_person,
        phone,
        email,
        address
    });
    res.json({ message: 'Supplier berhasil ditambahkan', data: supplier });
}

export const getSuppliers = async (req, res) => {
    const {search} = req.query;
    const filter = {};

    if (search) {
        filter.$or = [
            {supplier_name: {$regex: search, $options: 'i'}},
            {email: {$regex: search, $options: 'i'}},
        ];
    }
    const suppliers = await Supplier.find(filter).sort({supplier_name: 1});
    res.json({ message: 'Supplier berhasil diambil', data: suppliers });
}

export const getSuppliersById = async (req, res) => {
    const suppliers = await Supplier.findById(req.params.id);
    if (!suppliers) return res.status(404).json({message: 'Supplier Tidak Ditemukan'});
    res.json({ message: 'Supplier berhasil diambil', data: suppliers });
}
export const updateSupplier = async (req, res) => {
    const suppliers = await Supplier.findById(req.params.id);
    if (!suppliers) return res.status(404).json({message: 'Supplier Tidak Ditemukan'});

    const {supplier_name, contact_person, phone, email, address} = req.body;
    if (supplier_name !== undefined) suppliers.supplier_name = supplier_name;
    if (contact_person !== undefined) suppliers.contact_person = contact_person;
    if (phone !== undefined) suppliers.phone = phone;
    if (email !== undefined) suppliers.email = email;
    if (address !== undefined) suppliers.address = address;

    await suppliers.save();
    res.json({ message: 'Supplier berhasil diperbarui', data: suppliers });
}

export const deleteSupplier = async (req, res) => {
    const supplliers = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplliers) return res.status(404).json({message: 'Supplier Tidak Ditemukan'});
    res.json({ message: 'Supplier berhasil dihapus', data: supplliers });
}