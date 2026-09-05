const { REQUIRED_COLUMNS, validateImport } = require('../services/energyImportService');
const Energy = require('../models/Energy');
const XLSX = require('xlsx');

function parseSpreadsheet(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  return {
    headers: rows.length ? Object.keys(rows[0]).map((header) => header.trim()) : [],
    rows
  };
}

function isSupportedSpreadsheet(file) {
  const filename = file.originalname.toLowerCase();
  return filename.endsWith('.csv') || filename.endsWith('.xlsx') || filename.endsWith('.xls');
}

async function prepareImport(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Upload a CSV or Excel file' });
    if (!isSupportedSpreadsheet(file)) {
      return res.status(415).json({ success: false, message: 'Only CSV and Excel files are supported' });
    }

    const rows = parseSpreadsheet(file.buffer);
    const missingColumns = REQUIRED_COLUMNS.filter((column) => !rows.headers.includes(column));
    if (missingColumns.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        data: { headers: rows.headers, missingColumns }
      });
    }

    const validation = await validateImport(rows.rows);
    res.status(200).json({
      success: true,
      data: {
        totalRows: rows.rows.length,
        validRows: validation.valid.length,
        invalidRows: validation.errors.length,
        duplicateRows: validation.duplicates.length,
        preview: validation.valid.slice(0, 20),
        errors: validation.errors,
        duplicates: validation.duplicates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function importEnergy(req, res) {
  try {
    const file = req.file;
    if (!file || !isSupportedSpreadsheet(file)) {
      return res.status(415).json({ success: false, message: 'Upload a CSV or Excel file' });
    }

    const parsed = parseSpreadsheet(file.buffer);
    const missingColumns = REQUIRED_COLUMNS.filter((column) => !parsed.headers.includes(column));
    if (missingColumns.length) {
      return res.status(400).json({ success: false, message: `Missing required columns: ${missingColumns.join(', ')}` });
    }

    const validation = await validateImport(parsed.rows);
    if (validation.errors.length || validation.duplicates.length) {
      return res.status(422).json({
        success: false,
        message: 'Import rejected because the file contains invalid or duplicate rows',
        data: { invalidRows: validation.errors, duplicateRows: validation.duplicates }
      });
    }

    const inserted = await Energy.insertMany(validation.valid, { ordered: true });
    res.status(201).json({
      success: true,
      data: { totalRows: parsed.rows.length, importedRows: inserted.length, failedRows: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { prepareImport, importEnergy };
