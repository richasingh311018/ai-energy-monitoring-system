require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Energy = require('./models/Energy');
const Prediction = require('./models/Prediction');
const { REFINERY_DEPARTMENTS } = require('./config/refineryDepartments');

const buildDemoRecords = () => {
  const records = [];
  const today = new Date();

  REFINERY_DEPARTMENTS.forEach((department, departmentIndex) => {
    for (let day = 29; day >= 0; day -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - day);
      date.setHours(0, 0, 0, 0);

      const trend = (29 - day) * 8;
      const dailyVariation = ((day + departmentIndex * 3) % 7) * 12;
      records.push({
        energyId: `DEMO-${department.departmentId}-${String(30 - day).padStart(2, '0')}`,
        departmentId: department.departmentId,
        energyConsumed: department.demoBaseKwh + trend + dailyVariation,
        date
      });
    }
  });

  return records;
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring');
  try {
    await Department.collection.dropIndexes();
  } catch (error) {
    if (error.code !== 26) {
      throw error;
    }
  }
  await Promise.all([
    Department.deleteMany({}),
    Energy.deleteMany({}),
    Prediction.deleteMany({})
  ]);

  await Department.insertMany(
    REFINERY_DEPARTMENTS.map(({ demoBaseKwh, ...department }) => department)
  );
  const records = buildDemoRecords();
  await Energy.insertMany(records);

  console.log(`Seeded ${REFINERY_DEPARTMENTS.length} refinery departments and ${records.length} demo energy records.`);
  console.log('Demo values are illustrative development data, not Hindalco measurements.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
