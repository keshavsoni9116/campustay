// FILE: backend/routes/roommate.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/roommateController');
const { protect, authorize } = require('../middleware/auth');

router.post('/survey',  protect, authorize('student'), ctrl.saveSurvey);
router.get ('/matches', protect, authorize('student'), ctrl.getMatches);

module.exports = router;
