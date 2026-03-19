// FILE: backend/routes/bookings.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',             protect, authorize('student'), ctrl.create);          // student books
router.get ('/my',           protect, authorize('student'), ctrl.getMyBookings);   // student's bookings
router.get ('/owner',        protect, authorize('owner'),   ctrl.getOwnerBookings);// owner's requests
router.put ('/:id/status',   protect, authorize('owner'),   ctrl.updateStatus);    // owner decides
router.delete('/:id',        protect, authorize('student'), ctrl.cancel);          // student cancels

module.exports = router;
