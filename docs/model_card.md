# Model Card: SIH26017 Land Acquisition Delay Prediction Engine

## Model Details
- **Model Name**: Prerna-LA Calibrated Delay Classifier
- **Model Version**: `xgb-v1.0.0`
- **Architecture**: Gradient Boosted Trees (XGBoost / LightGBM) with Isotonic Probability Calibration
- **Developer**: SIH26017 Development Team (Ministry of Rural Development Decision Support Project)
- **Release Date**: August 2026

---

## Intended Use
- **Primary Use Case**: Early warning decision-support for Land Acquisition Officers (LAOs), District Magistrates (DMs), and Ministry Decision Makers to detect projects at risk of timeline slippage before deadlines elapse.
- **Out of Scope / Prohibited Use**: This model **must not** be used to automatically make legal land expropriation decisions or deny statutory compensation rights. Human officials maintain final decision-making responsibility.

---

## Factors & Feature Space
The model evaluates 28 process features grouped into:
1. **Milestone Velocity**: Current stage age, days since inception, days to target deadline, progress gap.
2. **Regulatory Clearances**: Pending title verification, Form 19 gazette declaration, Forest Stage-II NOC, Utility shifting agreements.
3. **Compensation Settlement**: Total award vs disbursed compensation ratio via DBT/PFMS.
4. **Public & Legal Friction**: Section 15 landowner objections, active High Court stay injunctions.
5. **Regional Baselines**: Historical district delay rate and infrastructure sector complexity.

---

## Performance Metrics (Holdout Test Set)

| Metric | Score | Operational Significance |
| :--- | :--- | :--- |
| **ROC-AUC** | **0.9532** | Exceptional discriminative ranking ability |
| **PR-AUC** | **0.9970** | High precision across all probability thresholds |
| **Recall** | **99.36%** | Minimizes false negatives (catches delayed cases early) |
| **Precision** | **95.90%** | Minimizes false alarms to prevent officer alert fatigue |
| **F1-Score** | **0.9760** | Balanced harmonic performance |
| **Brier Score** | **0.0384** | Calibrated probabilities reflecting true delay likelihood |

---

## Ethical Considerations & Governance
- **Data Privacy**: No Personally Identifiable Information (Aadhaar, bank account numbers, phone numbers) is stored or processed in model training.
- **Explainability**: Every prediction is augmented with SHAP-based feature importance weights to ensure transparency and accountability.
- **Continuous Audit**: All inferences and interventions are logged with user identifiers for governance review.
