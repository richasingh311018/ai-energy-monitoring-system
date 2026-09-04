// controllers/departmentController.js
const Department = require('../models/Department');
const {
  REFINERY_DEPARTMENTS,
  REFINERY_DEPARTMENT_IDS
} = require('../config/refineryDepartments');

// @desc    Add a new department
// @route   POST /api/departments
exports.addDepartment = async (req, res) => {
  try {
    const { departmentId, departmentName, location } = req.body;

    if (!departmentId || !departmentName || !location) {
      return res.status(400).json({ success: false, message: 'departmentId, departmentName and location are required' });
    }
    if (!REFINERY_DEPARTMENT_IDS.has(departmentId)) {
      return res.status(400).json({ success: false, message: 'Only Hindalco refinery process departments are allowed' });
    }

    const existing = await Department.findOne({ departmentId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Department with this ID already exists' });
    }

    const department = await Department.create({ departmentId, departmentName, location });
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    const departmentOrder = new Map(
      REFINERY_DEPARTMENTS.map((department, index) => [department.departmentId, index])
    );
    departments.sort(
      (a, b) => departmentOrder.get(a.departmentId) - departmentOrder.get(b.departmentId)
    );
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single department by departmentId
// @route   GET /api/departments/:departmentId
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({ departmentId: req.params.departmentId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:departmentId
exports.updateDepartment = async (req, res) => {
  try {
    const { departmentName, location } = req.body;

    const department = await Department.findOneAndUpdate(
      { departmentId: req.params.departmentId },
      { $set: { departmentName, location } },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:departmentId
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndDelete({ departmentId: req.params.departmentId });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
