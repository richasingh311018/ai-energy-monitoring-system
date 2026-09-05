const REFINERY_DEPARTMENTS = [
  {
    departmentId: 'BAUXITE_GRINDING',
    departmentName: 'Bauxite Handling & Grinding',
    location: 'Raw Material Handling'
  },
  {
    departmentId: 'DIGESTION',
    departmentName: 'Digestion',
    location: 'Digestion Area'
  },
  {
    departmentId: 'CLARIFICATION',
    departmentName: 'Clarification',
    location: 'Clarification Area'
  },
  {
    departmentId: 'EVAPORATION',
    departmentName: 'Evaporation',
    location: 'Evaporation Area'
  },
  {
    departmentId: 'PRECIPITATION',
    departmentName: 'Precipitation',
    location: 'Precipitation Area'
  },
  {
    departmentId: 'CALCINATION',
    departmentName: 'Calcination',
    location: 'Calcination Area'
  }
];

const REFINERY_DEPARTMENT_IDS = new Set(
  REFINERY_DEPARTMENTS.map((department) => department.departmentId)
);

module.exports = { REFINERY_DEPARTMENTS, REFINERY_DEPARTMENT_IDS };
