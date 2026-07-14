import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const run = async () => {
  await connectDB();

  const exists = await User.findOne({ username: 'cashier' });
  if (exists) {
    console.log('ℹKasir sudah ada, tidak dibuat ulang.');
    return process.exit(0);
  }

  await User.create({
    username: 'cashier',
    name: 'Kasir',
    role: 'cashier',
    password: 'cashier123',
  });

  console.log('Kasir dibuat -> username: cashier | password: cashier123');
  console.log('Segera ganti password default ini.');
  process.exit(0);
};

run();
