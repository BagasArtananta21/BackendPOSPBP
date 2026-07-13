import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {type: String, required: true, unique: true, trim: true, index: true},
    password_hash: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, enum: ['admin', 'cashier'], required: true},
    is_active: {type: Boolean, default: true},
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.virtual('password').set(function (plain) {
  this._password = plain;
});

userSchema.pre('validate', async function () {
  if (this._password) {
    this.password_hash = await bcrypt.hash(this._password, 10);
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password_hash);
};

export default mongoose.model('User', userSchema);
