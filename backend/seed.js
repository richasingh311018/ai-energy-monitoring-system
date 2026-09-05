require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Energy = require('./models/Energy');
const { REFINERY_DEPARTMENTS } = require('./config/refineryDepartments');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring');
  for (const department of REFINERY_DEPARTMENTS) {
    await Department.updateOne(
      { departmentId: department.departmentId },
      { $set: department },
      { upsert: true, runValidators: true }
    );
  }
  const removedDemoRecords = await Energy.deleteMany({ energyId: /^DEMO-/ });
  console.log(`Ensured ${REFINERY_DEPARTMENTS.length} Hindalco process-area master records.`);
  console.log(`Removed ${removedDemoRecords.deletedCount} legacy generated energy records.`);
  console.log('No new energy measurements were generated.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
