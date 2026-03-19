// FILE: backend/controllers/adminController.js
// Admin-only endpoints: stats, user management, property approval.

const User     = require('../models/User');
const Property = require('../models/Property');
const Booking  = require('../models/Booking');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalBookings, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Property.countDocuments({ isApproved: false }),
    ]);
    res.json({ totalUsers, totalProperties, totalBookings, pendingApprovals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/users/:id  — toggle active/inactive or update role
exports.updateUser = async (req, res) => {
  try {
    const { status, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(role && { role }) },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/properties
exports.getProperties = async (req, res) => {
  try {
    const props = await Property.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(props);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/properties/:id/approve
exports.approveProperty = async (req, res) => {
  try {
    const { isApproved } = req.body; // true or false
    const prop = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!prop) return res.status(404).json({ message: 'Property not found.' });
    res.json(prop);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId',  'name email')
      .populate('propertyId', 'name city')
      .populate('ownerId',    'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
