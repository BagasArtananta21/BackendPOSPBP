import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1) protect: verifikasi JWT, lampirkan req.user
export const protect = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password_hash');
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User tidak valid atau non-aktif' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};

// 2) authorize: batasi endpoint ke role tertentu, mis. authorize('admin')
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Akses khusus untuk: ${roles.join(', ')}` });
    }
    next();
  };
