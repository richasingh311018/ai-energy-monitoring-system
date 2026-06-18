// utils/linearRegression.js
// Simple Linear Regression: y = mx + b
// x = day index (number of days since first record)
// y = energy consumed

/**
 * Train a simple linear regression model using least squares.
 * @param {Array<{x: number, y: number}>} points
 * @returns {{slope: number, intercept: number}}
 */
function trainLinearRegression(points) {
  const n = points.length;

  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }

  if (n === 1) {
    // Not enough data to compute a slope, assume flat trend
    return { slope: 0, intercept: points[0].y };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denominator = (n * sumXX - sumX * sumX);

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Predict y for a given x using trained model.
 * @param {{slope: number, intercept: number}} model
 * @param {number} x
 * @returns {number}
 */
function predict(model, x) {
  const value = model.slope * x + model.intercept;
  return value < 0 ? 0 : value;
}

module.exports = { trainLinearRegression, predict };
