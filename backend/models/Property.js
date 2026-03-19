// FILE: backend/models/Property.js

const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    ownerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    name: {
      type:     String,
      required: [true, 'Property name is required.'],
      trim:     true,
    },
    type: {
      type:    String,
      enum:    ['PG', 'Hostel'],
      required: true,
    },
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    pincode:  { type: String },
    lat:      { type: Number },  // for Leaflet map
    lng:      { type: Number },
    price: {
      type:     Number,
      required: [true, 'Monthly rent is required.'],
    },
    gender: {
      type:    String,
      enum:    ['Boys', 'Girls', 'Both'],
      default: 'Both',
    },
    totalRooms: { type: Number, default: 1 },
    amenities:  { type: [String], default: [] },  // ['WiFi','AC','Meals',…]
    description:{ type: String, default: '' },
    photos:     { type: [String], default: [] },  // array of image URLs / paths
    rules:      { type: String, default: '' },
    rating:     { type: Number, default: 0, min: 0, max: 5 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for full-text search on name & city
PropertySchema.index({ name: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Property', PropertySchema);
