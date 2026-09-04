const REFINERY_DEPARTMENTS = [
  {
    departmentId: 'BAUXITE_GRINDING',
    departmentName: 'Bauxite Handling & Grinding',
    location: 'Raw Material Handling',
    demoBaseKwh: 1850
  },
  {
    departmentId: 'DIGESTION',
    departmentName: 'Digestion',
    location: 'Digestion Area',
    demoBaseKwh: 2400
  },
  {
    departmentId: 'CLARIFICATION',
    departmentName: 'Clarification',
    location: 'Clarification Area',
    demoBaseKwh: 1350
  },
  {
    departmentId: 'EVAPORATION',
    departmentName: 'Evaporation',
    location: 'Evaporation Area',
    demoBaseKwh: 2100
  },
  {
    departmentId: 'PRECIPITATION',
    departmentName: 'Precipitation',
    location: 'Precipitation Area',
    demoBaseKwh: 1750
  },
  {
    departmentId: 'CALCINATION',
    departmentName: 'Calcination',
    location: 'Calcination Area',
    demoBaseKwh: 3200
  }
];

const REFINERY_DEPARTMENT_IDS = new Set(
  REFINERY_DEPARTMENTS.map((department) => department.departmentId)
);

module.exports = { REFINERY_DEPARTMENTS, REFINERY_DEPARTMENT_IDS };
