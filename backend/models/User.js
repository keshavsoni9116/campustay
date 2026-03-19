// FILE: backend/models/User.js
// Mongoose schema for all platform users (students, owners, admins).

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type:     String,
      required: [true, 'Email is required.'],
      unique:   true,
      lowercase: true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email.'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required.'],
      minlength: 6,
      select:   false, // excluded from queries by default
    },
    role: {
      type:    String,
      enum:    ['student', 'owner', 'admin'],
      default: 'student',
    },
    status: {
      type:    String,
      enum:    ['active', 'inactive'],
      default: 'active',
    },
    profilePic: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', UserSchema);
