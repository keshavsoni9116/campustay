// FILE: backend/routes/admin.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

router.get  ('/stats',                   ...adminOnly, ctrl.getStats);
router.get  ('/users',                   ...adminOnly, ctrl.getUsers);
router.put  ('/users/:id',               ...adminOnly, ctrl.updateUser);
router.delete('/users/:id',              ...adminOnly, ctrl.deleteUser);
router.get  ('/properties',              ...adminOnly, ctrl.getProperties);
router.put  ('/properties/:id/approve',  ...adminOnly, ctrl.approveProperty);
router.get  ('/bookings',                ...adminOnly, ctrl.getBookings);

module.exports = router;
