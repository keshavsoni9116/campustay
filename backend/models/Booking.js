// FILE: backend/models/Booking.js

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    propertyId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Property',
      required: true,
    },
    ownerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    message: {
      type:    String,   // optional note from the student
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent a student from booking the same property twice with status pending
BookingSchema.index({ studentId: 1, propertyId: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
