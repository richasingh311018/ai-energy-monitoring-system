"""
predict.py
AI Prediction Module - Standalone Python script

Uses Pandas, NumPy, and Scikit-Learn (Linear Regression) to analyze
historical energy consumption data and predict future consumption
for a given department.

Usage:
    python predict.py --csv energy_data.csv --department D001 --days-ahead 7

Expected CSV columns:
    energyId, departmentId, energyConsumed, date

This script can be run independently (e.g., via a cron job or
data-science notebook) and the results can be pushed back to the
MongoDB 'predictions' collection via the Node.js API
(POST /api/predict) or directly via pymongo.
"""

import argparse
import sys
from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def load_data(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path, parse_dates=['date'])
    required_cols = {'energyId', 'departmentId', 'energyConsumed', 'date'}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")
    return df


def filter_department(df: pd.DataFrame, department_id: str) -> pd.DataFrame:
    dept_df = df[df['departmentId'] == department_id].copy()
    if dept_df.empty:
        raise ValueError(f"No records found for department '{department_id}'")
    return dept_df.sort_values('date')


def train_model(dept_df: pd.DataFrame):
    first_date = dept_df['date'].min()
    dept_df['day_index'] = (dept_df['date'] - first_date).dt.days

    X = dept_df[['day_index']].values
    y = dept_df['energyConsumed'].values

    model = LinearRegression()
    model.fit(X, y)

    return model, first_date, dept_df['day_index'].max()


def predict_future(model, first_date, last_day_index, days_ahead: int):
    future_day_index = last_day_index + days_ahead
    predicted_value = model.predict(np.array([[future_day_index]]))[0]
    predicted_value = max(predicted_value, 0)  # consumption cannot be negative
    predicted_date = first_date + timedelta(days=int(future_day_index))
    return predicted_value, predicted_date


def main():
    parser = argparse.ArgumentParser(
        description='Predict future energy consumption using Linear Regression.'
    )
    parser.add_argument('--csv', required=True, help='Path to CSV file with energy consumption data')
    parser.add_argument('--department', required=True, help='Department ID to analyze')
    parser.add_argument('--days-ahead', type=int, default=1, help='Number of days ahead to predict')

    args = parser.parse_args()

    try:
        df = load_data(args.csv)
        dept_df = filter_department(df, args.department)

        if len(dept_df) < 2:
            print('Not enough historical data (need at least 2 records).', file=sys.stderr)
            sys.exit(1)

        model, first_date, last_day_index = train_model(dept_df)
        predicted_value, predicted_date = predict_future(model, first_date, last_day_index, args.days_ahead)

        print('--------------------------------------------------')
        print(f"Department        : {args.department}")
        print(f"Training records  : {len(dept_df)}")
        print(f"Model coefficients: slope={model.coef_[0]:.4f}, intercept={model.intercept_:.4f}")
        print(f"Predicted date     : {predicted_date.date()}")
        print(f"Predicted consumption (kWh): {predicted_value:.2f}")
        print('--------------------------------------------------')

    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
