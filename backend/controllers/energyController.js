// controllers/energyController.js
const Energy = require('../models/Energy');
const Department = require('../models/Department');

// @desc    Record daily energy consumption
// @route   POST /api/energy
exports.addEnergyRecord = async (req, res) => {
  try {
    const { energyId, departmentId, energyConsumed, date } = req.body;

    if (!energyId || !departmentId || energyConsumed === undefined) {
      return res.status(400).json({ success: false, message: 'energyId, departmentId and energyConsumed are required' });
    }

    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department does not exist' });
    }

    const existing = await Energy.findOne({ energyId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Energy record with this ID already exists' });
    }

    const record = await Energy.create({
      energyId,
      departmentId,
      energyConsumed,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all energy records (optionally filter by departmentId)
// @route   GET /api/energy?departmentId=D001&from=&to=
exports.getEnergyRecords = async (req, res) => {
  try {
    const { departmentId, from, to } = req.query;
    const filter = {};

    if (departmentId) filter.departmentId = departmentId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await Energy.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single energy record
// @route   GET /api/energy/:energyId
exports.getEnergyRecordById = async (req, res) => {
  try {
    const record = await Energy.findOne({ energyId: req.params.energyId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Energy record not found' });
    }
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update an energy record
// @route   PUT /api/energy/:energyId
exports.updateEnergyRecord = async (req, res) => {
  try {
    const { energyConsumed, date } = req.body;

    const update = {};
    if (energyConsumed !== undefined) update.energyConsumed = energyConsumed;
    if (date) update.date = new Date(date);

    const record = await Energy.findOneAndUpdate(
      { energyId: req.params.energyId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Energy record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete an energy record
// @route   DELETE /api/energy/:energyId
exports.deleteEnergyRecord = async (req, res) => {
  try {
    const record = await Energy.findOneAndDelete({ energyId: req.params.energyId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Energy record not found' });
    }

    res.status(200).json({ success: true, message: 'Energy record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
