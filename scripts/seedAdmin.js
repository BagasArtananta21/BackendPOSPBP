import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const run = async () => {
  await connectDB();

  const exists = await User.findOne({ username: 'admin' });
  if (exists) {
    console.log('ℹAdmin sudah ada, tidak dibuat ulang.');
    return process.exit(0);
  }

  await User.create({
    username: 'admin',
    name: 'Administrator',
    role: 'admin',
    password: 'admin111', 
  });

  console.log('Admin dibuat -> username: admin | password: admin123');
  console.log('Segera ganti password default ini.');
  process.exit(0);
};

run();
