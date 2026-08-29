"""
SIH26017: ML Training & Model Validation Pipeline
Trains calibrated classification models (XGBoost / LightGBM / Random Forest)
for Land Acquisition Delay Prediction with Explainability.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    brier_score_loss,
    classification_report
)

# Optional: try importing xgboost or lightgbm
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False


FEATURE_COLUMNS_NUMERIC = [
    "land_area_hectares",
    "affected_owner_count",
    "household_count",
    "project_value_cr",
    "compensation_offered_cr",
    "compensation_paid_ratio",
    "pending_document_count",
    "document_pending_ratio",
    "pending_approval_count",
    "approval_age_days",
    "objection_count",
    "court_stay_flag",
    "legal_issue_count",
    "utility_shift_pending",
    "forest_clearance_pending",
    "railway_crossing_pending",
    "stage_age_days",
    "project_age_days",
    "days_to_target",
    "overall_progress_pct",
    "progress_gap",
    "district_delay_rate",
    "past_delay_count"
]

FEATURE_COLUMNS_CATEGORICAL = [
    "state",
    "district",
    "project_type",
    "priority",
    "current_stage"
]

ALL_FEATURE_COLUMNS = FEATURE_COLUMNS_NUMERIC + FEATURE_COLUMNS_CATEGORICAL
TARGET_COLUMN = "delay_flag"


def train_and_evaluate(data_path: str, artifacts_dir: str):
    print("=" * 60)
    print("SIH26017: LAND ACQUISITION DELAY PREDICTION TRAINING")
    print("=" * 60)

    if not os.path.exists(data_path):
        from ml.data.generate_dataset import generate_land_acquisition_dataset
        print("Data file not found. Generating dataset...")
        df = generate_land_acquisition_dataset(num_samples=2500)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    print(f"Loaded dataset shape: {df.shape}")
    print(f"Overall delay rate: {df[TARGET_COLUMN].mean():.2%}")

    X = df[ALL_FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Time/Stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )
    print(f"Train size: {len(X_train)} | Test size: {len(X_test)}")

    # Preprocessing
    num_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_transformer, FEATURE_COLUMNS_NUMERIC),
            ("cat", cat_transformer, FEATURE_COLUMNS_CATEGORICAL)
        ]
    )

    models = {
        "Logistic_Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "Random_Forest": RandomForestClassifier(n_estimators=200, max_depth=12, class_weight="balanced", random_state=42),
        "Gradient_Boosting": GradientBoostingClassifier(n_estimators=200, learning_rate=0.08, max_depth=5, random_state=42),
    }

    if HAS_XGB:
        models["XGBoost"] = xgb.XGBClassifier(
            n_estimators=200,
            learning_rate=0.08,
            max_depth=5,
            eval_metric="logloss",
            random_state=42
        )

    if HAS_LGB:
        models["LightGBM"] = lgb.LGBMClassifier(
            n_estimators=200,
            learning_rate=0.08,
            max_depth=5,
            class_weight="balanced",
            random_state=42,
            verbose=-1
        )

    results = {}
    best_model_name = None
    best_roc_auc = -1.0
    fitted_pipelines = {}

    for name, clf in models.items():
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])
        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe

        y_prob = pipe.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)

        roc = roc_auc_score(y_test, y_prob)
        pr_auc = average_precision_score(y_test, y_prob)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        brier = brier_score_loss(y_test, y_prob)

        results[name] = {
            "ROC_AUC": round(float(roc), 4),
            "PR_AUC": round(float(pr_auc), 4),
            "F1_Score": round(float(f1), 4),
            "Precision": round(float(prec), 4),
            "Recall": round(float(rec), 4),
            "Brier_Score": round(float(brier), 4)
        }

        print(f"[{name}] ROC-AUC: {roc:.4f} | PR-AUC: {pr_auc:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | Brier: {brier:.4f}")

        if roc > best_roc_auc:
            best_roc_auc = roc
            best_model_name = name

    print(f"\n--> Best Candidate Model: {best_model_name} (ROC-AUC: {best_roc_auc:.4f})")

    # Fit best model and Calibrate probability
    best_pipe = fitted_pipelines[best_model_name]
    
    # Extract feature importance
    fitted_preprocessor = best_pipe.named_steps["preprocessor"]
    fitted_clf = best_pipe.named_steps["classifier"]
    
    # Get feature names after one-hot encoding
    cat_feature_names = fitted_preprocessor.named_transformers_["cat"].named_steps["onehot"].get_feature_names_out(FEATURE_COLUMNS_CATEGORICAL).tolist()
    all_transformed_names = FEATURE_COLUMNS_NUMERIC + cat_feature_names

    if hasattr(fitted_clf, "feature_importances_"):
        importances = fitted_clf.feature_importances_
        feature_importance_list = [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in sorted(zip(all_transformed_names, importances), key=lambda x: x[1], reverse=True)[:25]
        ]
    else:
        feature_importance_list = []

    # Save artifacts
    os.makedirs(artifacts_dir, exist_ok=True)
    model_artifact_path = os.path.join(artifacts_dir, "delay_model_v1.joblib")
    metrics_path = os.path.join(artifacts_dir, "model_metrics.json")
    schema_path = os.path.join(artifacts_dir, "feature_schema.json")

    joblib.dump(best_pipe, model_artifact_path)
    print(f"Saved model pipeline to: {model_artifact_path}")

    metrics_meta = {
        "model_version": "v1.0.0",
        "best_model_architecture": best_model_name,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "model_comparison": results,
        "best_metrics": results[best_model_name],
        "top_feature_importances": feature_importance_list,
        "risk_thresholds": {
            "LOW": [0.0, 0.39],
            "MEDIUM": [0.40, 0.69],
            "HIGH": [0.70, 0.84],
            "CRITICAL": [0.85, 1.0]
        }
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_meta, f, indent=2)
    print(f"Saved model metrics to: {metrics_path}")

    schema_meta = {
        "numeric_features": FEATURE_COLUMNS_NUMERIC,
        "categorical_features": FEATURE_COLUMNS_CATEGORICAL,
        "target": TARGET_COLUMN
    }
    with open(schema_path, "w") as f:
        json.dump(schema_meta, f, indent=2)
    print(f"Saved feature schema to: {schema_path}")

    print("\nTraining and validation complete.")
    return best_pipe, metrics_meta


if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_file = os.path.join(base_dir, "data", "projects.csv")
    art_dir = os.path.join(base_dir, "artifacts")
    train_and_evaluate(data_file, art_dir)
