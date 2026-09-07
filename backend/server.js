require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const departmentRoutes = require('./routes/departmentRoutes');
const energyRoutes = require('./routes/energyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const importRoutes = require('./routes/importRoutes');
const { REFINERY_DEPARTMENTS } = require('./config/refineryDepartments');
const Department = require('./models/Department');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const { requireAuth } = require('./middleware/auth');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in production');
}

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'energyiq.sid',
  secret: process.env.SESSION_SECRET || 'development-only-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring' }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', requireAuth, departmentRoutes);
app.use('/api/energy', requireAuth, energyRoutes);
app.use('/api/analysis', requireAuth, analysisRoutes);
app.use('/api/predict', requireAuth, predictionRoutes);
app.use('/api/reports', requireAuth, reportRoutes);
app.use('/api/import', requireAuth, importRoutes);

app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? 'healthy' : 'degraded',
    database: databaseReady ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Energy Monitor API running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled request error:', error);
  if (res.headersSent) return next(error);
  return res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : error.message
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energy_monitoring')
  .then(() => {
    return Promise.all(REFINERY_DEPARTMENTS.map((department) => Department.updateOne(
      { departmentId: department.departmentId },
      { $setOnInsert: department },
      { upsert: true, runValidators: true }
    )));
  })
  .then(() => {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      if (isProduction) {
        throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required in production');
      }
      return null;
    }

    return User.findOne({ username: process.env.ADMIN_USERNAME }).then(async (existingUser) => {
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await User.create({
          username: process.env.ADMIN_USERNAME,
          passwordHash,
          role: 'admin'
        });
      }
      return null;
    });
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exitCode = 1;
  });