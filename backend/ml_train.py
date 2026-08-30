import pathlib
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

def generate_synthetic_fraud_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic financial transaction dataset for fraud risk detection.
    Features:
      - amount: Transaction amount in currency
      - hour: Transaction hour (0-23)
      - category: Transaction category
      - merchant_risk: Risk score associated with merchant (0.0 to 1.0)
      - transaction_type: Channel (POS, Online, ATM, Transfer)
      - velocity_last_24h: Transaction count in past 24 hours
      - is_international: Whether transaction originated internationally (0 or 1)
      - is_suspicious: Ground truth fraud target (0: Legitimate, 1: Fraudulent)
    """
    np.random.seed(random_state)

    categories = [
        "Groceries", "Food", "Shopping", "Travel", "Entertainment",
        "Electronics", "Crypto/Investment", "Money Transfer", "Utilities", "General"
    ]
    tx_types = ["POS", "Online", "ATM", "Transfer"]

    # Base features for legitimate transactions
    amounts = np.random.exponential(scale=75.0, size=n_samples) + 5.0
    hour_weights = np.array([
        1, 1, 1, 1, 1, 2,
        3, 5, 7, 8, 8, 8,
        8, 8, 7, 7, 7, 7,
        6, 5, 3, 2, 1, 1
    ], dtype=float)
    hour_probs = hour_weights / hour_weights.sum()
    hours = np.random.choice(range(24), size=n_samples, p=hour_probs)
    cats = np.random.choice(categories, size=n_samples, p=[
        0.25, 0.20, 0.18, 0.06, 0.08,
        0.06, 0.03, 0.04, 0.08, 0.02
    ])

    types = np.random.choice(tx_types, size=n_samples, p=[0.45, 0.35, 0.10, 0.10])
    merchant_risks = np.clip(np.random.beta(a=1.5, b=8.0, size=n_samples), 0.01, 0.95)
    velocities = np.random.poisson(lam=2.0, size=n_samples) + 1
    internationals = np.random.binomial(n=1, p=0.06, size=n_samples)

    df = pd.DataFrame({
        "amount": np.round(amounts, 2),
        "hour": hours,
        "category": cats,
        "merchant_risk": np.round(merchant_risks, 3),
        "transaction_type": types,
        "velocity_last_24h": velocities,
        "is_international": internationals,
        "is_suspicious": 0
    })

    # Inject realistic fraud patterns (~6.5% fraud rate)
    n_fraud = int(n_samples * 0.065)
    fraud_indices = np.random.choice(df.index, size=n_fraud, replace=False)

    for idx in fraud_indices:
        pattern = np.random.choice(["high_amount_night", "high_velocity_crypto", "international_transfer", "card_testing"])
        if pattern == "high_amount_night":
            df.loc[idx, "amount"] = np.round(np.random.uniform(1500, 12000), 2)
            df.loc[idx, "hour"] = np.random.choice([0, 1, 2, 3, 4])
            df.loc[idx, "merchant_risk"] = np.round(np.random.uniform(0.5, 0.9), 3)
            df.loc[idx, "transaction_type"] = "Online"
        elif pattern == "high_velocity_crypto":
            df.loc[idx, "amount"] = np.round(np.random.uniform(500, 5000), 2)
            df.loc[idx, "category"] = "Crypto/Investment"
            df.loc[idx, "velocity_last_24h"] = np.random.randint(7, 18)
            df.loc[idx, "merchant_risk"] = np.round(np.random.uniform(0.6, 0.95), 3)
        elif pattern == "international_transfer":
            df.loc[idx, "amount"] = np.round(np.random.uniform(2000, 15000), 2)
            df.loc[idx, "category"] = "Money Transfer"
            df.loc[idx, "is_international"] = 1
            df.loc[idx, "transaction_type"] = "Transfer"
        elif pattern == "card_testing":
            df.loc[idx, "amount"] = np.round(np.random.uniform(1.0, 5.0), 2)
            df.loc[idx, "velocity_last_24h"] = np.random.randint(10, 25)
            df.loc[idx, "transaction_type"] = "Online"
            df.loc[idx, "merchant_risk"] = np.round(np.random.uniform(0.4, 0.8), 3)

        df.loc[idx, "is_suspicious"] = 1

    return df


def train_fraud_model():
    print("Generating synthetic financial transactions dataset for Fraud Detection...")
    df = generate_synthetic_fraud_dataset(n_samples=6000, random_state=42)
    print(f"Total dataset size: {len(df)} transactions")
    fraud_count = df["is_suspicious"].sum()
    legit_count = len(df) - fraud_count
    print(f"Distribution: {legit_count} Legitimate ({legit_count/len(df):.1%}), {fraud_count} Fraudulent ({fraud_count/len(df):.1%})")

    features = ["amount", "hour", "category", "merchant_risk", "transaction_type", "velocity_last_24h", "is_international"]
    target = "is_suspicious"

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    numeric_features = ["amount", "hour", "merchant_risk", "velocity_last_24h", "is_international"]
    categorical_features = ["category", "transaction_type"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(
                n_estimators=150,
                max_depth=12,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1
            ))
        ]
    )

    print("\nTraining Random Forest Fraud Detection Pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    print("\n=== Model Evaluation Report ===")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print("\nConfusion Matrix:")
    print(f"  TN: {cm[0, 0]} | FP: {cm[0, 1]}")
    print(f"  FN: {cm[1, 0]} | TP: {cm[1, 1]}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraudulent"]))

    # Save Pipeline
    model_output_path = pathlib.Path(__file__).parent / "fraud_model.pkl"
    joblib.dump(pipeline, model_output_path)
    print(f"Fraud detection pipeline successfully saved to {model_output_path.name}!")


if __name__ == "__main__":
    train_fraud_model()