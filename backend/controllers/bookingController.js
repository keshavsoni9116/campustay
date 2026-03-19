// FILE: backend/controllers/bookingController.js

const Booking  = require('../models/Booking');
const Property = require('../models/Property');

// POST /api/bookings — student creates a booking request
exports.create = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const prop = await Property.findById(propertyId);
    if (!prop || !prop.isApproved)
      return res.status(404).json({ message: 'Property not found.' });

    const existing = await Booking.findOne({ studentId: req.user._id, propertyId, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending booking for this property.' });

    const booking = await Booking.create({
      studentId:  req.user._id,
      propertyId,
      ownerId:    prop.ownerId,
    });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/my — student's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user._id })
      .populate('propertyId', 'name city type price emoji')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/owner — owner's incoming requests
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId', 'name city type')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/bookings/:id/status — owner approves or declines
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved','declined'].includes(status))
      return res.status(400).json({ message: 'Status must be approved or declined.' });

    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found or unauthorized.' });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/bookings/:id — student cancels a pending booking
exports.cancel = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user._id, status: 'pending' });
    if (!booking) return res.status(404).json({ message: 'Pending booking not found.' });
    await booking.deleteOne();
    res.json({ message: 'Booking cancelled.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
