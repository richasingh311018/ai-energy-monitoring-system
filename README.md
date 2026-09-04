# AI-Based Energy Consumption Monitoring and Analysis System

A full-stack MERN application that monitors department-wise energy
consumption, analyzes trends, and predicts future consumption using a
Linear Regression model.

## Project Structure

```
energy-monitoring/
├── backend/
│   ├── server.js
│   ├── models/
│   │   ├── Department.js
│   │   ├── Energy.js
│   │   └── Prediction.js
│   ├── controllers/
│   │   ├── departmentController.js
│   │   ├── energyController.js
│   │   ├── analysisController.js
│   │   ├── predictionController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── departmentRoutes.js
│   │   ├── energyRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── predictionRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   └── linearRegression.js
│   ├── ml/
│   │   ├── predict.py            (standalone Python/Scikit-Learn script)
│   │   └── requirements.txt
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── index.css
    │   ├── api.js
    │   └── components/
    │       ├── Dashboard.js
    │       ├── Departments.js
    │       ├── EnergyRecords.js
    │       ├── Analysis.js
    │       ├── Prediction.js
    │       └── Reports.js
    ├── package.json
    └── .env
```

## Technology Stack

- **Frontend:** React.js + Recharts (charts/dashboard)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Machine Learning:** Linear Regression
  - Built-in JS implementation (`utils/linearRegression.js`) used live by the API
  - Standalone Python script (`ml/predict.py`) using Pandas, NumPy, Scikit-Learn for offline analysis

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas)
- Python 3.9+ (only if using the standalone ML script)

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` if needed:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/energy_monitoring
```

Start the backend:

```bash
npm start
# or for auto-reload during development:
npm run dev
```

The API will be available at `http://localhost:5000/api`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will run at `http://localhost:3000` and communicate with
the backend at the URL configured in `frontend/.env`
(`VITE_API_URL=http://localhost:5000/api`).

### 4. (Optional) Standalone Python ML Script

```bash
cd backend/ml
pip install -r requirements.txt
python predict.py --csv energy_data.csv --department D001 --days-ahead 7
```

The CSV must contain columns: `energyId, departmentId, energyConsumed, date`.

## API Endpoints

### Department Management Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/departments | Add a department |
| GET    | /api/departments | Get all departments |
| GET    | /api/departments/:departmentId | Get a department |
| PUT    | /api/departments/:departmentId | Update a department |
| DELETE | /api/departments/:departmentId | Delete a department |

### Energy Monitoring Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/energy | Record energy consumption |
| GET    | /api/energy | Get all records (filter by departmentId, from, to) |
| GET    | /api/energy/:energyId | Get a single record |
| PUT    | /api/energy/:energyId | Update a record |
| DELETE | /api/energy/:energyId | Delete a record |

### Analysis Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analysis/trend?period=daily\|weekly\|monthly | Consumption trend |
| GET | /api/analysis/department-comparison | Compare departments |
| GET | /api/analysis/highest-consumption | Highest consuming department(s) |
| GET | /api/analysis/summary | Overall summary stats |

### AI Prediction Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/predict | Train model & predict (body: departmentId, daysAhead) |
| GET  | /api/predict?departmentId= | Get stored predictions |

### Report Generation Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/monthly?year=&month= | Monthly report |
| GET | /api/reports/department/:departmentId | Department report |
| GET | /api/reports/summary | Consumption summary report |
| GET | /api/reports/predictions | Prediction report |

## How the AI Prediction Works

1. Historical energy consumption records for a department are fetched
   and sorted by date.
2. Each record is converted to a point `(x, y)` where `x` is the number
   of days since the first record and `y` is the energy consumed (kWh).
3. A simple linear regression model `y = mx + b` is trained using the
   least squares method.
4. The model predicts consumption for `daysAhead` days after the most
   recent record.
5. The prediction is stored in the `predictions` collection and returned
   to the frontend.

## Notes

- Make sure at least **2 energy records** exist for a department before
  requesting a prediction (regression requires at least 2 points).
- All dates are stored as ISO date strings; the frontend uses
  `<input type="date">` for entry.
