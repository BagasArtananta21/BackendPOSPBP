import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const login = async (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  const user = await User.findOne({username});
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
      role: user.role, 
    },
  });
};

export const logout = async (req, res) => {
  res.json({ message: 'Logout berhasil' });
}

export const getMe = async (req, res) => {
  res.json({user: req.user});
};
