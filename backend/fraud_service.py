import pathlib
import joblib
import pandas as pd
from typing import Dict, Any

MODEL_PATH = pathlib.Path(__file__).parent / "fraud_model.pkl"
model = joblib.load(MODEL_PATH)


def predict_fraud(
    amount: float,
    hour: int,
    category: str = "General",
    merchant_risk: float = 0.1,
    transaction_type: str = "Online",
    velocity_last_24h: int = 1,
    is_international: int = 0
) -> Dict[str, Any]:
    """
    Predicts transaction fraud risk probability and suspicion flag using trained Random Forest pipeline.
    Accepts core features with sensible defaults for backward compatibility.
    """
    # Safe sanitization and bounds checking
    clean_amount = float(amount)
    clean_hour = int(hour)
    clean_category = str(category or "General").strip() or "General"
    clean_merchant_risk = float(merchant_risk if merchant_risk is not None else 0.1)
    clean_tx_type = str(transaction_type or "Online").strip() or "Online"
    clean_velocity = int(velocity_last_24h if velocity_last_24h is not None else 1)
    clean_international = int(1 if is_international else 0)

    features = pd.DataFrame([{
        "amount": clean_amount,
        "hour": clean_hour,
        "category": clean_category,
        "merchant_risk": clean_merchant_risk,
        "transaction_type": clean_tx_type,
        "velocity_last_24h": clean_velocity,
        "is_international": clean_international
    }])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]
    prob_float = round(float(probability), 2)

    if prob_float >= 0.70:
        risk_level = "High"
    elif prob_float >= 0.35:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "is_suspicious": bool(prediction),
        "risk_probability": prob_float,
        "risk_level": risk_level
    }