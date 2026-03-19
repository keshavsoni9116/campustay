// FILE: backend/controllers/roommateController.js
// Handles survey submission and compatibility-based matching.

const RoommateProfile = require('../models/RoommateProfile');

// POST /api/roommate/survey — student submits or updates their profile
exports.saveSurvey = async (req, res) => {
  try {
    const data = {
      userId:        req.user._id,
      sleepSchedule: req.body.sleepSchedule,
      studyHabits:   req.body.studyHabits,
      cleanliness:   req.body.cleanliness,
      diet:          req.body.diet,
      smoking:       req.body.smoking  || false,
      drinking:      req.body.drinking || false,
      socialLevel:   req.body.socialLevel,
      budget:        req.body.budget,
      preferredArea: req.body.preferredArea,
      lastUpdated:   new Date(),
    };

    const profile = await RoommateProfile.findOneAndUpdate(
      { userId: req.user._id },
      data,
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/roommate/matches — returns other students sorted by compatibility %
exports.getMatches = async (req, res) => {
  try {
    const mine = await RoommateProfile.findOne({ userId: req.user._id });
    if (!mine) return res.status(404).json({ message: 'Please complete your survey first.' });

    // Fetch all other student profiles
    const others = await RoommateProfile.find({ userId: { $ne: req.user._id } })
      .populate('userId', 'name email profilePic');

    const FIELDS = ['sleepSchedule','studyHabits','cleanliness','diet','socialLevel','budget'];

    const scored = others.map(other => {
      let score = 0;
      FIELDS.forEach(f => { if (mine[f] === other[f]) score++; });
      if (mine.smoking  === other.smoking)  score += 0.5;
      if (mine.drinking === other.drinking) score += 0.5;

      const total = FIELDS.length + 1; // +1 for the two half-point booleans
      const compat = Math.round((score / total) * 100);

      return {
        userId:     other.userId?._id,
        name:       other.userId?.name,
        email:      other.userId?.email,
        profilePic: other.userId?.profilePic,
        compat,
        sharedTraits: FIELDS.filter(f => mine[f] === other[f]),
      };
    });

    scored.sort((a, b) => b.compat - a.compat);
    res.json(scored);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
