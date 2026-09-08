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
// @route   GET /api/analysis/trend?period=daily&departmentId=BAUXITE_GRINDING
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

const calculatePercentChange = (current, previous) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0;
  }

  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
};

// @desc    Derive plant-wide efficiency insights and operational alerts
// @route   GET /api/analysis/insights
exports.getOperationalInsights = async (req, res) => {
  try {
    const records = await Energy.find({}).sort({ date: 1 }).lean();
    const departments = await Department.find({}).lean();

    if (!records.length || !departments.length) {
      return res.status(200).json({
        success: true,
        data: {
          summaryCards: [],
          alerts: [],
          opportunities: [],
          departmentScorecard: [],
          monthlyDelta: 0,
          headline: 'Add department and energy records to unlock AI insights.'
        }
      });
    }

    const deptMap = {};
    departments.forEach((department) => {
      deptMap[department.departmentId] = department;
    });

    const departmentStats = {};
    records.forEach((record) => {
      const key = record.departmentId;
      if (!departmentStats[key]) {
        departmentStats[key] = {
          departmentId: key,
          departmentName: deptMap[key]?.departmentName || key,
          location: deptMap[key]?.location || 'Unknown',
          totalConsumption: 0,
          recordCount: 0,
          avgConsumption: 0,
          latestConsumption: 0,
          previousConsumption: 0
        };
      }

      departmentStats[key].totalConsumption += Number(record.energyConsumed || 0);
      departmentStats[key].recordCount += 1;
    });

    const monthTotals = {};
    records.forEach((record) => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthTotals[key] = (monthTotals[key] || 0) + Number(record.energyConsumed || 0);
    });

    const monthlyKeys = Object.keys(monthTotals).sort();
    const latestMonthKey = monthlyKeys[monthlyKeys.length - 1];
    const previousMonthKey = monthlyKeys[monthlyKeys.length - 2] || latestMonthKey;
    const latestMonthConsumption = monthTotals[latestMonthKey] || 0;
    const previousMonthConsumption = monthTotals[previousMonthKey] || 0;
    const monthlyDelta = calculatePercentChange(latestMonthConsumption, previousMonthConsumption);

    const allAverages = Object.values(departmentStats).map((department) => ({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
      location: department.location,
      avgConsumption: department.totalConsumption / department.recordCount,
      totalConsumption: department.totalConsumption
    }));

    const globalAvg = allAverages.reduce((sum, dept) => sum + dept.avgConsumption, 0) / allAverages.length;

    const departmentScorecard = allAverages
      .map((department) => ({
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        location: department.location,
        totalConsumption: department.totalConsumption,
        avgConsumption: department.avgConsumption,
        efficiencyScore: Math.max(0, Math.min(100, 100 - ((department.avgConsumption - globalAvg) / Math.max(globalAvg, 1)) * 100))
      }))
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    const peakDepartment = departmentScorecard.reduce((leader, current) => {
      if (!leader || current.totalConsumption > leader.totalConsumption) {
        return current;
      }
      return leader;
    }, null);

    const bestEfficiencyDepartment = departmentScorecard[0];

    const alerts = departmentScorecard
      .filter((department) => department.efficiencyScore < 75)
      .slice(0, 3)
      .map((department) => ({
        id: department.departmentId,
        title: `${department.departmentName} is above the plant average`,
        message: `Average draw is ${department.avgConsumption.toFixed(0)} kWh, which is below the expected efficiency threshold for this plant.`,
        severity: department.efficiencyScore < 60 ? 'high' : 'medium'
      }));

    const opportunities = departmentScorecard
      .filter((department) => department.efficiencyScore >= 75)
      .slice(0, 3)
      .map((department) => ({
        id: department.departmentId,
        title: `${department.departmentName} is operating efficiently`,
        message: `Sustain this performance to reduce peak load risk and protect the plant’s operating margin.`,
        severity: 'low'
      }));

    const summaryCards = [
      {
        label: 'Plant load',
        value: `${latestMonthConsumption.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh`,
        detail: `${monthlyDelta >= 0 ? 'Up' : 'Down'} ${Math.abs(monthlyDelta).toFixed(1)}% vs previous month`
      },
      {
        label: 'Top consumer',
        value: peakDepartment ? peakDepartment.departmentName : 'N/A',
        detail: peakDepartment ? `${peakDepartment.totalConsumption.toFixed(0)} kWh total` : 'No department data'
      },
      {
        label: 'Best efficiency',
        value: bestEfficiencyDepartment ? `${bestEfficiencyDepartment.efficiencyScore}%` : 'N/A',
        detail: bestEfficiencyDepartment ? bestEfficiencyDepartment.departmentName : 'No score available'
      },
      {
        label: 'Operational alerts',
        value: String(alerts.length),
        detail: alerts.length ? 'Departments need attention' : 'All departments within target range'
      }
    ];

    const headline = monthlyDelta > 5
      ? 'Consumption is trending above target and needs action.'
      : monthlyDelta < -5
        ? 'Energy usage is improving and the site is operating efficiently.'
        : 'Operations remain stable with manageable demand variation.';

    res.status(200).json({
      success: true,
      data: {
        summaryCards,
        alerts,
        opportunities,
        departmentScorecard,
        monthlyDelta,
        headline
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
