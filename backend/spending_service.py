import pathlib
import joblib
import pandas as pd
from typing import Dict, Any, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from models import Transaction

MODEL_PATH = pathlib.Path(__file__).parent / "spending_model.pkl"
model = joblib.load(MODEL_PATH)


def predict_spending(
    month: int,
    prev_month_spending: Optional[float] = None,
    avg_spending_3m: Optional[float] = None,
    transaction_count: Optional[int] = None,
    discretionary_ratio: Optional[float] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Predicts monthly financial expenditure using trained Gradient Boosting pipeline.
    Derives features from database transactions when available, or applies intelligent baselines.
    """
    # 1. Check if we can derive metrics from active database session
    derived_spending = None
    derived_count = None

    if db is not None:
        try:
            total_sum = db.query(func.sum(Transaction.amount)).scalar()
            total_cnt = db.query(func.count(Transaction.id)).scalar()
            if total_sum and total_sum > 0:
                derived_spending = float(total_sum)
            if total_cnt and total_cnt > 0:
                derived_count = int(total_cnt)
        except Exception:
            pass


    # 2. Establish sensible defaults / fallbacks
    clean_prev_spending = float(prev_month_spending if prev_month_spending is not None else (derived_spending or 22000.0))
    clean_avg_3m = float(avg_spending_3m if avg_spending_3m is not None else clean_prev_spending * 0.98)
    clean_tx_count = int(transaction_count if transaction_count is not None else (derived_count or max(5, int(clean_prev_spending / 600))))
    clean_disc_ratio = float(discretionary_ratio if discretionary_ratio is not None else 0.32)

    features = pd.DataFrame([{
        "month": int(month),
        "prev_month_spending": clean_prev_spending,
        "avg_spending_3m": clean_avg_3m,
        "transaction_count": clean_tx_count,
        "discretionary_ratio": clean_disc_ratio
    }])

    prediction = model.predict(features)[0]
    predicted_val = round(float(prediction), 2)

    return {
        "month": int(month),
        "predicted_spending": predicted_val,
        "baseline_spending": round(clean_prev_spending, 2)
    }