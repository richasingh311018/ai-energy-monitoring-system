const Energy = require('../models/Energy');
const Department = require('../models/Department');

const REQUIRED_COLUMNS = ['energyId', 'departmentId', 'energyConsumed', 'date'];

function normalizeRow(row) {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    normalized[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
  });
  return normalized;
}

function validateRows(rows, departments) {
  const departmentIds = new Set(departments.map((department) => department.departmentId));
  const seenIds = new Set();
  const valid = [];
  const errors = [];

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const row = normalizeRow(rawRow);
    const rowErrors = [];

    REQUIRED_COLUMNS.forEach((column) => {
      if (row[column] === undefined || row[column] === '') {
        rowErrors.push(`${column} is required`);
      }
    });

    const consumption = Number(row.energyConsumed);
    const parsedDate = new Date(row.date);
    if (row.energyConsumed !== undefined && (!Number.isFinite(consumption) || consumption < 0)) {
      rowErrors.push('energyConsumed must be a non-negative number');
    }
    if (row.date !== undefined && Number.isNaN(parsedDate.getTime())) {
      rowErrors.push('date must be a valid date');
    }
    if (row.departmentId && !departmentIds.has(row.departmentId)) {
      rowErrors.push('departmentId is not a valid Hindalco process area');
    }
    if (row.energyId && seenIds.has(row.energyId)) {
      rowErrors.push('duplicate energyId in uploaded file');
    }

    if (rowErrors.length) {
      errors.push({ row: rowNumber, errors: rowErrors, data: row });
      return;
    }

    seenIds.add(row.energyId);
    valid.push({
      energyId: row.energyId,
      departmentId: row.departmentId,
      energyConsumed: consumption,
      date: parsedDate
    });
  });

  return { valid, errors };
}

async function validateImport(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { valid: [], errors: [{ row: 0, errors: ['The uploaded file contains no rows'] }], duplicates: [] };
  }

  const departments = await Department.find({}, { departmentId: 1 }).lean();
  const result = validateRows(rows, departments);
  const ids = result.valid.map((row) => row.energyId);
  const existing = await Energy.find({ energyId: { $in: ids } }, { energyId: 1 }).lean();
  const existingIds = new Set(existing.map((row) => row.energyId));
  const duplicates = result.valid.filter((row) => existingIds.has(row.energyId)).map((row) => row.energyId);
  result.valid = result.valid.filter((row) => !existingIds.has(row.energyId));
  return { ...result, duplicates };
}

module.exports = { REQUIRED_COLUMNS, validateImport };
