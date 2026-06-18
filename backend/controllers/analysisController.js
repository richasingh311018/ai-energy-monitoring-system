// controllers/analysisController.js
const Energy = require('../models/Energy');
const Department = require('../models/Department');

// Helper to build date-group expression based on period
const getGroupIdByPeriod = (period) => {
  switch (period) {
    case 'daily':
      return {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      };
    case 'weekly':
      return {
        year: { $isoWeekYear: '$date' },
        week: { $isoWeek: '$date' }
      };
    case 'monthly':
      return {
        year: { $year: '$date' },
        month: { $month: '$date' }
      };
    default:
      return {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      };
  }
};

// @desc    Get consumption trend (daily/weekly/monthly) optionally by department
// @route   GET /api/analysis/trend?period=daily&departmentId=D001
exports.getConsumptionTrend = async (req, res) => {
  try {
    const { period = 'daily', departmentId } = req.query;
    const match = {};
    if (departmentId) match.departmentId = departmentId;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: getGroupIdByPeriod(period),
          totalConsumption: { $sum: '$energyConsumed' },
          avgConsumption: { $avg: '$energyConsumed' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ];

    const result = await Energy.aggregate(pipeline);
    res.status(200).json({ success: true, period, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Compare energy consumption across all departments
// @route   GET /api/analysis/department-comparison?from=&to=
exports.getDepartmentComparison = async (req, res) => {
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

    // Attach department names
    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => { deptMap[d.departmentId] = d; });

    const data = result.map(r => ({
      departmentId: r._id,
      departmentName: deptMap[r._id] ? deptMap[r._id].departmentName : 'Unknown',
      location: deptMap[r._id] ? deptMap[r._id].location : 'Unknown',
      totalConsumption: r.totalConsumption,
      avgConsumption: r.avgConsumption,
      recordCount: r.recordCount
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Identify department(s) with highest energy consumption
// @route   GET /api/analysis/highest-consumption?from=&to=&limit=1
exports.getHighestConsumption = async (req, res) => {
  try {
    const { from, to, limit = 1 } = req.query;
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
          totalConsumption: { $sum: '$energyConsumed' }
        }
      },
      { $sort: { totalConsumption: -1 } },
      { $limit: parseInt(limit, 10) }
    ];

    const result = await Energy.aggregate(pipeline);

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach(d => { deptMap[d.departmentId] = d; });

    const data = result.map(r => ({
      departmentId: r._id,
      departmentName: deptMap[r._id] ? deptMap[r._id].departmentName : 'Unknown',
      location: deptMap[r._id] ? deptMap[r._id].location : 'Unknown',
      totalConsumption: r.totalConsumption
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get overall summary statistics
// @route   GET /api/analysis/summary
exports.getSummary = async (req, res) => {
  try {
    const totalResult = await Energy.aggregate([
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$energyConsumed' },
          avgConsumption: { $avg: '$energyConsumed' },
          recordCount: { $sum: 1 }
        }
      }
    ]);

    const departmentCount = await Department.countDocuments();

    const summary = totalResult[0] || { totalConsumption: 0, avgConsumption: 0, recordCount: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalConsumption: summary.totalConsumption,
        avgConsumption: summary.avgConsumption,
        recordCount: summary.recordCount,
        departmentCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
