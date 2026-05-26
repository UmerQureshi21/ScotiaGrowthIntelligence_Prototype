# Scotia Growth Intelligence

CaseHacks 2026 · Scotiabank case · Team submission

An ML engine that catches young Scotia depositors at the moment they're ready to invest, before they leave for Wealthsimple. Predicts readiness, picks the right product, and routes the nudge through the right channel.

**Team:** Abishek · Ahmed · Shervin · Umer



## The model

- **Readiness scoring** — Logistic Regression · 78% recall
- **Product matching** — HistGradientBoosting · 6 classes (TFSA, FHSA, RRSP, Smart Investor, iTRADE, GIC)
- **Channel selection** — HistGradientBoosting · 4 classes (in-app, email, SMS, advisor)

Trained on 250,000 synthetic Scotia-style customer profiles with 65 features across behavioral, financial, relationship, and demographic signals.

---

## Run it

```bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib
jupyter notebook model_training.ipynb
```

Run all cells. Outputs save to `outputs/`. Total runtime ~15-20 min.

---

## Use the trained models

```python
import joblib, pandas as pd

bundle = joblib.load('models/scotia_growth_intelligence_models.pkl')

customer = pd.DataFrame([{...65 features...}])[bundle['feature_cols']]

likelihood = bundle['readiness_model'].predict_proba(customer)[0, 1]
product    = bundle['product_model'].predict(customer)[0]
channel    = bundle['channel_model'].predict(customer)[0]
```

---

*Built in 24 hours. Synthetic data for competition purposes only.*
