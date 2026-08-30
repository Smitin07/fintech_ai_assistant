import pathlib
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def generate_synthetic_spending_dataset(n_samples: int = 2500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-user financial spending dataset for monthly forecasting.
    Features:
      - month: Calendar month (1-12)
      - prev_month_spending: Spending in previous month
      - avg_spending_3m: 3-month moving average of spending
      - transaction_count: Monthly transaction volume
      - discretionary_ratio: Proportion of non-essential spending (0.0 - 1.0)
      - spending: Actual target spending in next month
    """
    np.random.seed(random_state)

    months = np.random.randint(1, 13, size=n_samples)

    # Base income / spending tiers across users (low, mid, high)
    base_spends = np.random.choice([12000, 22000, 45000, 75000], size=n_samples, p=[0.3, 0.45, 0.2, 0.05])
    user_variances = np.random.normal(0, 0.10, size=n_samples)

    prev_spending = base_spends * (1 + user_variances)
    avg_3m = prev_spending * (1 + np.random.normal(0, 0.06, size=n_samples))
    tx_count = np.clip((prev_spending / 500) + np.random.normal(0, 5, size=n_samples), 5, 150).astype(int)
    disc_ratio = np.clip(np.random.beta(a=2.0, b=4.0, size=n_samples), 0.05, 0.85)

    # Monthly Seasonality multipliers (e.g. Nov-Dec holiday boost, Jan lull, Jul vacation)
    seasonality_map = {
        1: 0.90,   # Post-holiday saving
        2: 0.94,
        3: 0.98,
        4: 1.00,
        5: 1.02,
        6: 1.06,
        7: 1.10,   # Summer vacation
        8: 1.08,
        9: 1.02,   # Back to school
        10: 1.04,
        11: 1.18,  # Black Friday / shopping
        12: 1.28   # Holiday spending
    }
    seasonal_factors = np.array([seasonality_map[m] for m in months])

    # Target spending calculation with macroeconomic noise
    target_spending = (
        0.55 * prev_spending +
        0.35 * avg_3m +
        (disc_ratio * 4000)
    ) * seasonal_factors + np.random.normal(0, 800, size=n_samples)

    target_spending = np.clip(target_spending, 3000, None)

    return pd.DataFrame({
        "month": months,
        "prev_month_spending": np.round(prev_spending, 2),
        "avg_spending_3m": np.round(avg_3m, 2),
        "transaction_count": tx_count,
        "discretionary_ratio": np.round(disc_ratio, 3),
        "spending": np.round(target_spending, 2)
    })


def train_spending_model():
    print("Generating synthetic financial history dataset for Spending Prediction...")
    df = generate_synthetic_spending_dataset(n_samples=3000, random_state=42)
    print(f"Total dataset size: {len(df)} user-month spending records")
    print(f"Target spending range: Min ${df['spending'].min():,.2f} | Mean ${df['spending'].mean():,.2f} | Max ${df['spending'].max():,.2f}")

    features = ["month", "prev_month_spending", "avg_spending_3m", "transaction_count", "discretionary_ratio"]
    target = "spending"

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("regressor", GradientBoostingRegressor(
                n_estimators=120,
                max_depth=4,
                learning_rate=0.08,
                random_state=42
            ))
        ]
    )

    print("\nTraining Gradient Boosting Spending Prediction Pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n=== Spending Model Evaluation Report ===")
    print(f"Mean Absolute Error (MAE):     ${mae:,.2f}")
    print(f"Root Mean Squared Error (RMSE): ${rmse:,.2f}")
    print(f"R-squared (R2 Score):          {r2:.4f}")

    # Save Pipeline
    model_output_path = pathlib.Path(__file__).parent / "spending_model.pkl"
    joblib.dump(pipeline, model_output_path)
    print(f"Spending prediction pipeline successfully saved to {model_output_path.name}!")


if __name__ == "__main__":
    train_spending_model()