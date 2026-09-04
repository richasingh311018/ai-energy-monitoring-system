const express = require('express');
const router = express.Router();
const {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

router.post('/', addDepartment);
router.get('/', getDepartments);
router.get('/:departmentId', getDepartmentById);
router.put('/:departmentId', updateDepartment);
router.delete('/:departmentId', deleteDepartment);

module.exports = router;