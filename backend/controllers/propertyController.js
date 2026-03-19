// FILE: backend/controllers/propertyController.js

const Property = require('../models/Property');

// GET /api/properties — public, filterable
exports.getAll = async (req, res) => {
  try {
    const { type, gender, city, minPrice, maxPrice } = req.query;
    const filter = { isApproved: true };
    if (type)     filter.type   = type;
    if (gender)   filter.gender = { $in: [gender, 'Both'] };
    if (city)     filter.city   = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const props = await Property.find(filter).populate('ownerId', 'name email');
    res.json(props);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/properties/:id
exports.getOne = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id).populate('ownerId', 'name email');
    if (!prop) return res.status(404).json({ message: 'Property not found.' });
    res.json(prop);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/properties — owner only
exports.create = async (req, res) => {
  try {
    const prop = await Property.create({ ...req.body, ownerId: req.user._id, isApproved: false });
    res.status(201).json(prop);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// PUT /api/properties/:id — owner only
exports.update = async (req, res) => {
  try {
    const prop = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!prop) return res.status(404).json({ message: 'Property not found or unauthorized.' });
    Object.assign(prop, req.body);
    await prop.save();
    res.json(prop);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// DELETE /api/properties/:id — owner or admin
exports.remove = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, ownerId: req.user._id };
    const prop = await Property.findOneAndDelete(filter);
    if (!prop) return res.status(404).json({ message: 'Property not found or unauthorized.' });
    res.json({ message: 'Property deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/properties/mine — owner's own listings
exports.getMine = async (req, res) => {
  try {
    const props = await Property.find({ ownerId: req.user._id });
    res.json(props);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
