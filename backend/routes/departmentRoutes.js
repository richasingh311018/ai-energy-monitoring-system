const express = require('express');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
const {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

router.post('/', requireRole('admin', 'manager'), addDepartment);
router.get('/', getDepartments);
router.get('/:departmentId', getDepartmentById);
router.put('/:departmentId', requireRole('admin', 'manager'), updateDepartment);
router.delete('/:departmentId', requireRole('admin'), deleteDepartment);

module.exports = router;