import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// ---- Global middleware ----
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Static: gambar produk hasil upload multer
app.use('/uploads', express.static('uploads'));

// ---- Healthcheck ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
// Tambahkan modul lain di sini seiring dibangun:
// import productRoutes from './routes/productRoutes.js';
// app.use('/api/products', productRoutes);

// ---- Error handling (harus paling bawah) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Konek DB dulu, baru nyalakan server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
