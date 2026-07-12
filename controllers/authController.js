import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// POST /api/auth/login
export const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  const user = await User.findOne({ username });
  // Pesan digabung supaya tidak membocorkan mana yang salah (username/password)
  if (!user || !user.is_active || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Username atau password salah' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role, // frontend pakai ini untuk routing Admin vs Cashier
    },
  });
};

// GET /api/auth/me  (cek sesi yang sedang login)
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
