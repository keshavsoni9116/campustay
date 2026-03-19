// FILE: backend/models/RoommateProfile.js

const mongoose = require('mongoose');

const RoommateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true,
    },
    sleepSchedule: {
      type: String,
      enum: ['early_bird', 'night_owl', 'flexible'],
    },
    studyHabits: {
      type: String,
      enum: ['silence', 'background_music', 'study_groups'],
    },
    cleanliness: {
      type: String,
      enum: ['spotless', 'tidy', 'relaxed'],
    },
    diet: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'no_preference'],
    },
    smoking:  { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    socialLevel: {
      type: String,
      enum: ['very_private', 'balanced', 'very_social'],
    },
    budget: {
      type: String,
      enum: ['under_8k', '8k_15k', '15k_25k', 'above_25k'],
    },
    preferredArea: { type: String, default: '' },
    lastUpdated:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoommateProfile', RoommateProfileSchema);
