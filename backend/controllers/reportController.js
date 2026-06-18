// controllers/reportController.js
const Energy = require('../models/Energy');
const Department = require('../models/Department');
const Prediction = require('../models/Prediction');

// @desc    Monthly report - total/avg consumption per department for a given month/year
// @route   GET /api/reports/monthly?year=2025&month=6
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'year and month query params are required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const pipeline = [
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$departmentId',
          totalConsumption: { $sum: '$energyConsumed' },
          avgConsumption: { $avg: '$energyConsumed' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { totalConsumption: -1 } }
    ];

    const result = await Energy.aggregate(pipeline);

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => { deptMap[d.departmentId] = d; });

    const data = result.map(r => ({
      departmentId: r._id,
      departmentName: deptMap[r._id] ? deptMap[r._id].departmentName : 'Unknown',
      location: deptMap[r._id] ? deptMap[r._id].location : 'Unknown',
      totalConsumption: r.totalConsumption,
      avgConsumption: Math.round(r.avgConsumption * 100) / 100,
      recordCount: r.recordCount
    }));

    res.status(200).json({
      success: true,
      report: 'monthly',
      period: { year: Number(year), month: Number(month) },
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Department-specific report
// @route   GET /api/reports/department/:departmentId?from=&to=
exports.getDepartmentReport = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { from, to } = req.query;

    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const match = { departmentId };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const records = await Energy.find(match).sort({ date: 1 });

    const totalConsumption = records.reduce((sum, r) => sum + r.energyConsumed, 0);
    const avgConsumption = records.length ? totalConsumption / records.length : 0;
    const maxRecord = records.length
      ? records.reduce((max, r) => (r.energyConsumed > max.energyConsumed ? r : max), records[0])
      : null;
    const minRecord = records.length
      ? records.reduce((min, r) => (r.energyConsumed < min.energyConsumed ? r : min), records[0])
      : null;

    res.status(200).json({
      success: true,
      report: 'department',
      department: {
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        location: department.location
      },
      summary: {
        totalConsumption,
        avgConsumption: Math.round(avgConsumption * 100) / 100,
        recordCount: records.length,
        highest: maxRecord ? { date: maxRecord.date, value: maxRecord.energyConsumed } : null,
        lowest: minRecord ? { date: minRecord.date, value: minRecord.energyConsumed } : null
      },
      records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Consumption summary report across all departments
// @route   GET /api/reports/summary?from=&to=
exports.getConsumptionSummaryReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$departmentId',
          totalConsumption: { $sum: '$energyConsumed' },
          avgConsumption: { $avg: '$energyConsumed' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { totalConsumption: -1 } }
    ];

    const result = await Energy.aggregate(pipeline);

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => { deptMap[d.departmentId] = d; });

    const grandTotal = result.reduce((sum, r) => sum + r.totalConsumption, 0);

    const data = result.map(r => ({
      departmentId: r._id,
      departmentName: deptMap[r._id] ? deptMap[r._id].departmentName : 'Unknown',
      totalConsumption: r.totalConsumption,
      avgConsumption: Math.round(r.avgConsumption * 100) / 100,
      recordCount: r.recordCount,
      percentageOfTotal: grandTotal ? Math.round((r.totalConsumption / grandTotal) * 10000) / 100 : 0
    }));

    res.status(200).json({
      success: true,
      report: 'consumption-summary',
      period: { from: from || 'all-time', to: to || 'all-time' },
      grandTotal,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Prediction report - latest predictions for all departments
// @route   GET /api/reports/predictions
exports.getPredictionReport = async (req, res) => {
  try {
    const departments = await Department.find();
    const report = [];

    for (const dept of departments) {
      const latestPrediction = await Prediction.findOne({ departmentId: dept.departmentId })
        .sort({ createdAt: -1 });

      report.push({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        latestPrediction: latestPrediction
          ? {
              predictedConsumption: latestPrediction.predictedConsumption,
              predictionDate: latestPrediction.predictionDate,
              generatedAt: latestPrediction.createdAt
            }
          : null
      });
    }

    res.status(200).json({ success: true, report: 'predictions', data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
