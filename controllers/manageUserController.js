import User from "../models/User.js";

export const createUser = async (req, res) => {
    const { username, name, role, password } = req.body;   

    const user = await User.create({ 
        username,  
        name, 
        role,
        password});
    const { password_hash, ...safe } = user.toObject();    
    res.status(201).json({ message: 'Karyawan berhasil dibuat', data: safe });
};

export const getUsers = async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === 'true';
    if (req.query.search) {
        filter.$or = [
            { name:{ $regex: req.query.search, $options: 'i' } },
            { username:{ $regex: req.query.search, $options: 'i' } },
        ];
    }

    const users = await User.find(filter).select('-password_hash').sort({ created_at: -1 });
    res.json({ data: users });
};

export const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    res.json({ data: user });
};

export const updateUser = async (req, res) => {
    const { username, name, role, is_active, password } = req.body;   

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });

    if (username !== undefined) user.username = username;
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password = password;   

    await user.save();   

    const { password_hash, ...safe } = user.toObject();
    res.json({ message: 'Karyawan berhasil diperbarui', data: safe });
};

export const deleteUser = async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ message: 'Tidak bisa menonaktifkan akun sendiri' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });

    user.is_active = false;
    await user.save();

    res.json({ message: 'Karyawan berhasil dinonaktifkan' });
};
