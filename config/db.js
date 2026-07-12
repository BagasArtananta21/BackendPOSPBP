import mongoose from 'mongoose';

// Koneksi ke MongoDB Atlas. Dipanggil sekali saat server start.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // gagal konek = tidak ada gunanya lanjut
  }
};

export default connectDB;
