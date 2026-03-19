// FILE: backend/routes/properties.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.get ('/',       ctrl.getAll);                                   // public
router.get ('/mine',   protect, authorize('owner'), ctrl.getMine);     // owner's listings
router.get ('/:id',    ctrl.getOne);                                   // public
router.post('/',       protect, authorize('owner'), ctrl.create);      // owner adds
router.put ('/:id',    protect, authorize('owner'), ctrl.update);      // owner edits
router.delete('/:id',  protect, authorize('owner','admin'), ctrl.remove); // owner or admin deletes

module.exports = router;
