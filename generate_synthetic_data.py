"""
generate_synthetic_data.py
==========================
Generates a synthetic dataset of Scotiabank customers aged 18-34 for the
Scotia Growth Intelligence model.

Features are designed to mirror the kind of behavioral, financial, and
engagement data a Canadian retail bank would have access to. Labels are
generated using rule-based propensity scores with stochastic noise so
that the patterns are learnable but not trivially deterministic.

Usage:
    python generate_synthetic_data.py --n_rows 250000 --out data/synthetic_scotia_customers.csv

Author: CaseHacks 2026 — P3 (Shervin)
"""

import argparse
import numpy as np
import pandas as pd
from pathlib import Path


# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------
SEED = 42
rng = np.random.default_rng(SEED)


# ---------------------------------------------------------------------------
# Reference distributions (loosely calibrated to Canadian demographic data)
# ---------------------------------------------------------------------------
PROVINCES = ["ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE"]
PROVINCE_WEIGHTS = [0.385, 0.225, 0.135, 0.115, 0.035, 0.030, 0.025, 0.020, 0.020, 0.010]

EDUCATION_LEVELS = ["high_school", "college", "bachelor", "masters", "phd"]
EDUCATION_WEIGHTS = [0.20, 0.30, 0.35, 0.12, 0.03]

EMPLOYMENT_STATUSES = ["employed", "self_employed", "part_time", "student", "unemployed"]
EMPLOYMENT_WEIGHTS = [0.65, 0.10, 0.12, 0.10, 0.03]

MARITAL_STATUSES = ["single", "partnered", "married", "divorced"]
MARITAL_WEIGHTS = [0.55, 0.20, 0.22, 0.03]

GENDERS = ["F", "M", "X"]
GENDER_WEIGHTS = [0.49, 0.49, 0.02]

LIFE_STAGES = ["early_career", "saving_for_home", "family_planning", "mid_career", "returning_to_school"]
LIFE_STAGE_WEIGHTS = [0.40, 0.25, 0.15, 0.15, 0.05]

PRODUCTS = ["TFSA", "FHSA", "RRSP", "Smart_Investor", "iTRADE", "GIC"]
CHANNELS = ["in_app", "email", "sms", "advisor_call"]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def truncated_normal(mean, std, low, high, size):
    """Sample from a truncated normal distribution."""
    out = rng.normal(mean, std, size)
    return np.clip(out, low, high)


def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))


def standardize(arr):
    """Z-score standardization for propensity calculations."""
    arr = np.asarray(arr, dtype=float)
    return (arr - arr.mean()) / (arr.std() + 1e-9)


# ---------------------------------------------------------------------------
# Core generator
# ---------------------------------------------------------------------------
def generate_features(n):
    """Generate the feature matrix (no labels yet)."""

    df = pd.DataFrame()
    df["customer_id"] = [f"SBC{str(i).zfill(8)}" for i in range(n)]

    # --- DEMOGRAPHICS -----------------------------------------------------
    df["age"] = rng.integers(18, 35, n)
    df["gender"] = rng.choice(GENDERS, n, p=GENDER_WEIGHTS)
    df["province"] = rng.choice(PROVINCES, n, p=PROVINCE_WEIGHTS)
    df["education_level"] = rng.choice(EDUCATION_LEVELS, n, p=EDUCATION_WEIGHTS)
    df["employment_status"] = rng.choice(EMPLOYMENT_STATUSES, n, p=EMPLOYMENT_WEIGHTS)
    df["marital_status"] = rng.choice(MARITAL_STATUSES, n, p=MARITAL_WEIGHTS)
    df["has_dependents"] = (rng.random(n) < (0.05 + 0.04 * (df["age"] - 18))).astype(int)

    # --- FINANCIAL --------------------------------------------------------
    # Income strongly tied to age and employment
    base_income = 20_000 + (df["age"] - 18) * 4_500
    emp_multiplier = df["employment_status"].map({
        "employed": 1.10, "self_employed": 1.05, "part_time": 0.45,
        "student": 0.20, "unemployed": 0.10,
    }).values
    edu_multiplier = df["education_level"].map({
        "high_school": 0.85, "college": 1.00, "bachelor": 1.20,
        "masters": 1.45, "phd": 1.65,
    }).values
    income_noise = rng.normal(1.0, 0.25, n)
    df["annual_income"] = np.clip(base_income * emp_multiplier * edu_multiplier * income_noise, 5_000, 250_000).round(0)
    df["monthly_take_home"] = (df["annual_income"] * 0.72 / 12).round(2)  # rough net-of-tax

    # Income band (for downstream readability)
    df["income_band"] = pd.cut(df["annual_income"],
                               bins=[0, 30_000, 60_000, 100_000, 300_000],
                               labels=["low", "mid", "upper_mid", "high"]).astype(str)

    # Credit score correlated with age, income, and a bit of noise
    credit_base = 550 + (df["age"] - 18) * 6 + (df["annual_income"] / 1000) * 1.2
    df["credit_score"] = np.clip(credit_base + rng.normal(0, 60, n), 300, 900).round(0)

    # Balances — chequing is roughly 0.5-2 months of take-home; savings is more variable
    df["chequing_balance"] = np.clip(
        df["monthly_take_home"] * rng.uniform(0.3, 2.5, n) + rng.normal(0, 1500, n),
        50, 60_000,
    ).round(2)
    df["savings_balance"] = np.clip(
        df["monthly_take_home"] * rng.uniform(0.0, 8.0, n) + rng.normal(0, 4000, n),
        0, 250_000,
    ).round(2)
    df["total_deposits"] = (df["chequing_balance"] + df["savings_balance"]).round(2)

    # Idle cash ratio — proxy for "money sitting around doing nothing"
    df["idle_cash_ratio"] = (df["total_deposits"] / (df["monthly_take_home"] + 1)).round(3)

    # Savings velocity — % growth of savings over last 90 days
    df["savings_velocity_90d"] = np.clip(rng.normal(0.04, 0.08, n), -0.30, 0.50).round(4)

    # Spending
    df["monthly_spending"] = np.clip(
        df["monthly_take_home"] * rng.uniform(0.50, 1.05, n), 800, 12_000,
    ).round(2)
    df["discretionary_spending_ratio"] = np.clip(rng.normal(0.28, 0.12, n), 0.05, 0.65).round(3)

    # Debt
    df["debt_to_income_ratio"] = np.clip(rng.exponential(0.20, n), 0.0, 1.5).round(3)
    df["credit_card_balance"] = np.clip(
        df["annual_income"] * rng.uniform(0.0, 0.15, n), 0, 25_000,
    ).round(2)
    df["credit_utilization"] = np.clip(rng.beta(2, 5, n), 0, 1).round(3)
    df["num_overdrafts_last_year"] = rng.poisson(0.6, n)
    df["num_nsf_last_year"] = rng.poisson(0.3, n)

    # --- SCOTIA RELATIONSHIP ---------------------------------------------
    df["tenure_with_scotia_years"] = np.clip(
        rng.exponential(3.5, n) + (df["age"] - 18) * 0.15, 0.1, 16,
    ).round(2)

    # Scotia product holdings — chequing assumed yes (target market), others vary
    df["has_chequing_with_scotia"] = 1
    df["has_savings_with_scotia"] = (rng.random(n) < 0.78).astype(int)
    df["has_credit_card_with_scotia"] = (rng.random(n) < (0.30 + 0.02 * (df["age"] - 18))).astype(int)
    df["has_mortgage_with_scotia"] = (rng.random(n) < (0.02 + 0.04 * np.maximum(0, df["age"] - 25))).astype(int)
    df["has_loan_with_scotia"] = (rng.random(n) < 0.15).astype(int)

    df["num_scotia_products"] = (
        df["has_chequing_with_scotia"] + df["has_savings_with_scotia"]
        + df["has_credit_card_with_scotia"] + df["has_mortgage_with_scotia"]
        + df["has_loan_with_scotia"]
    )

    df["is_scotia_primary_bank"] = (
        (df["num_scotia_products"] >= 2)
        & (rng.random(n) < (0.55 + 0.10 * df["num_scotia_products"]))
    ).astype(int)

    # --- DIGITAL ENGAGEMENT ----------------------------------------------
    df["mobile_app_user"] = (rng.random(n) < 0.88).astype(int)
    df["online_banking_user"] = (rng.random(n) < 0.94).astype(int)
    df["avg_monthly_app_logins"] = np.where(
        df["mobile_app_user"] == 1,
        np.clip(rng.gamma(3, 4, n), 0, 80).round(0),
        rng.integers(0, 2, n),
    )
    df["avg_monthly_branch_visits"] = np.clip(rng.poisson(0.4, n), 0, 8)
    df["avg_monthly_atm_visits"] = np.clip(rng.poisson(2.5, n), 0, 25)
    df["last_login_days_ago"] = np.clip(rng.exponential(3, n), 0, 365).round(0)
    df["email_open_rate_lifetime"] = np.clip(rng.beta(2, 5, n), 0, 1).round(3)

    # --- INVESTMENT ENGAGEMENT -------------------------------------------
    # Investing page views — most people are 0; some are exploratory
    investing_engaged = rng.random(n) < 0.25
    df["investing_page_views_90d"] = np.where(
        investing_engaged,
        np.clip(rng.gamma(2, 5, n), 0, 80).round(0),
        rng.binomial(2, 0.1, n),
    )
    df["educational_content_views_90d"] = np.where(
        investing_engaged,
        np.clip(rng.gamma(1.5, 3, n), 0, 50).round(0),
        rng.binomial(1, 0.05, n),
    )
    df["has_clicked_invest_cta_before"] = (
        (df["investing_page_views_90d"] > 5) & (rng.random(n) < 0.6)
    ).astype(int)
    df["has_abandoned_account_open_flow"] = (
        (df["has_clicked_invest_cta_before"] == 1) & (rng.random(n) < 0.45)
    ).astype(int)
    df["has_used_smart_money"] = (
        (df["mobile_app_user"] == 1) & (rng.random(n) < 0.32)
    ).astype(int)
    df["num_advisor_interactions_lifetime"] = np.clip(rng.poisson(0.5, n), 0, 20)
    df["last_advisor_interaction_days_ago"] = np.where(
        df["num_advisor_interactions_lifetime"] > 0,
        np.clip(rng.exponential(180, n), 0, 2000).round(0),
        9999,  # never
    )

    # --- LIFE-STAGE SIGNALS ----------------------------------------------
    # Life stage probabilities depend on age
    life_stage_probs = np.zeros((n, len(LIFE_STAGES)))
    for i in range(n):
        a = df["age"].iloc[i]
        if a <= 22:
            life_stage_probs[i] = [0.55, 0.05, 0.02, 0.03, 0.35]
        elif a <= 27:
            life_stage_probs[i] = [0.45, 0.30, 0.10, 0.10, 0.05]
        elif a <= 30:
            life_stage_probs[i] = [0.20, 0.40, 0.20, 0.18, 0.02]
        else:
            life_stage_probs[i] = [0.10, 0.25, 0.30, 0.34, 0.01]
    life_stage_probs = life_stage_probs / life_stage_probs.sum(axis=1, keepdims=True)
    df["life_stage_signal"] = [rng.choice(LIFE_STAGES, p=life_stage_probs[i]) for i in range(n)]

    df["has_recent_salary_increase"] = (rng.random(n) < 0.18).astype(int)
    df["recent_address_change"] = (rng.random(n) < 0.12).astype(int)
    df["recent_employer_change"] = (rng.random(n) < 0.15).astype(int)
    df["has_resp_for_child"] = ((df["has_dependents"] == 1) & (rng.random(n) < 0.3)).astype(int)
    df["recent_rrsp_content_engagement"] = (
        (df["investing_page_views_90d"] > 3) & (rng.random(n) < 0.4)
    ).astype(int)

    # --- TRIGGER FEATURES (the "moment") ---------------------------------
    df["recent_large_deposit"] = (rng.random(n) < 0.22).astype(int)
    df["recent_large_deposit_amount"] = np.where(
        df["recent_large_deposit"] == 1,
        np.clip(rng.lognormal(7.0, 0.7, n), 200, 25_000).round(2),
        0,
    )
    df["days_since_last_large_deposit"] = np.where(
        df["recent_large_deposit"] == 1,
        rng.integers(0, 30, n),
        rng.integers(60, 365, n),
    )
    df["balance_threshold_crossed_recently"] = (
        (df["savings_velocity_90d"] > 0.05) & (rng.random(n) < 0.4)
    ).astype(int)
    df["months_with_growing_balance"] = np.where(
        df["savings_velocity_90d"] > 0,
        rng.integers(1, 13, n),
        rng.integers(0, 4, n),
    )

    # --- EXISTING INVESTMENTS --------------------------------------------
    # Most of our target population (18-34, deposit-only) does NOT have these yet
    df["has_tfsa"] = (rng.random(n) < (0.18 + 0.015 * (df["age"] - 18))).astype(int)
    df["has_rrsp"] = (
        (df["age"] >= 24) & (rng.random(n) < (0.05 + 0.025 * (df["age"] - 24)))
    ).astype(int)
    df["has_fhsa"] = (rng.random(n) < 0.06).astype(int)
    df["has_brokerage_account"] = (rng.random(n) < 0.08).astype(int)
    df["total_investment_assets"] = np.where(
        (df["has_tfsa"] + df["has_rrsp"] + df["has_fhsa"] + df["has_brokerage_account"]) > 0,
        np.clip(rng.lognormal(8.5, 1.2, n), 100, 200_000).round(2),
        0,
    )
    df["is_first_time_investor"] = (
        (df["has_tfsa"] + df["has_rrsp"] + df["has_fhsa"] + df["has_brokerage_account"]) == 0
    ).astype(int)

    # --- RISK INDICATORS -------------------------------------------------
    risk_score = (
        0.4 * (df["investing_page_views_90d"] / 80)
        + 0.3 * (df["has_clicked_invest_cta_before"])
        + 0.2 * (df["credit_score"] / 900)
        - 0.2 * (df["num_overdrafts_last_year"] / 10)
        + rng.normal(0, 0.1, n)
    )
    df["risk_tolerance_inferred"] = pd.cut(
        risk_score, bins=[-np.inf, 0.15, 0.35, np.inf],
        labels=["low", "medium", "high"],
    ).astype(str)
    df["balance_volatility"] = np.clip(rng.beta(2, 5, n), 0, 1).round(3)
    df["has_emergency_fund_3months"] = (
        df["savings_balance"] >= 3 * df["monthly_spending"]
    ).astype(int)

    return df


# ---------------------------------------------------------------------------
# Label generation
# ---------------------------------------------------------------------------
def generate_labels(df):
    """
    Generate three target labels using rule-based propensity scores + noise.
    Designed so the patterns are learnable but not trivially deterministic.
    """
    n = len(df)

    # --- LABEL 1: will_convert_90d (binary) ------------------------------
    # Standardize key features so we can combine on the same scale
    f_idle = standardize(np.log1p(df["idle_cash_ratio"]))
    f_sv = standardize(df["savings_velocity_90d"])
    f_pv = standardize(np.log1p(df["investing_page_views_90d"]))
    f_edu = standardize(np.log1p(df["educational_content_views_90d"]))
    f_cta = standardize(df["has_clicked_invest_cta_before"])
    f_dep = standardize(df["recent_large_deposit"])
    f_prod = standardize(df["num_scotia_products"])
    f_app = standardize(np.log1p(df["avg_monthly_app_logins"]))
    f_credit = standardize(df["credit_score"])
    f_overdraft = standardize(df["num_overdrafts_last_year"])
    f_emerg = standardize(df["has_emergency_fund_3months"])

    propensity = (
        0.50 * f_idle + 0.55 * f_sv + 0.45 * f_pv + 0.35 * f_edu
        + 0.60 * f_cta + 0.70 * f_dep + 0.30 * f_prod
        + 0.25 * f_app + 0.20 * f_credit + 0.30 * f_emerg
        - 0.35 * f_overdraft
        + rng.normal(0, 0.6, n)  # noise: realistic, not too easy
    )

    # First-time investors are MUCH more likely to convert (they have nowhere to go but up)
    propensity += df["is_first_time_investor"] * 0.8

    # Convert to probability; threshold to get binary label (~25% positive rate)
    prob_convert = sigmoid(propensity - np.percentile(propensity, 75))
    df["will_convert_90d"] = (rng.random(n) < prob_convert).astype(int)

    # --- LABEL 2: best_product (multi-class) -----------------------------
    products = []
    for i in range(n):
        age = df["age"].iloc[i]
        life = df["life_stage_signal"].iloc[i]
        income = df["annual_income"].iloc[i]
        risk = df["risk_tolerance_inferred"].iloc[i]
        engagement = df["investing_page_views_90d"].iloc[i]
        edu_views = df["educational_content_views_90d"].iloc[i]
        cta = df["has_clicked_invest_cta_before"].iloc[i]
        has_fhsa = df["has_fhsa"].iloc[i]
        has_rrsp = df["has_rrsp"].iloc[i]
        has_mortgage = df["has_mortgage_with_scotia"].iloc[i]
        deposits = df["total_deposits"].iloc[i]

        # iTRADE: highly engaged self-directed types — check this FIRST
        if engagement > 15 and cta == 1 and risk == "high":
            products.append("iTRADE" if rng.random() < 0.80 else "Smart_Investor")
        # FHSA: saving for home, eligible age
        elif life == "saving_for_home" and age < 32 and not has_fhsa and not has_mortgage:
            products.append("FHSA" if rng.random() < 0.85 else "TFSA")
        # RRSP: older, higher income, doesn't have one yet
        elif age >= 26 and income >= 55_000 and not has_rrsp:
            products.append("RRSP" if rng.random() < 0.65 else "TFSA")
        # Smart Investor: moderate engagement and any meaningful deposits — wants guidance
        elif (engagement >= 3 or edu_views >= 2) and risk in ("medium", "high") and deposits >= 2000:
            products.append("Smart_Investor" if rng.random() < 0.70 else "TFSA")
        # GIC: low risk tolerance, conservative, or older risk-averse
        elif risk == "low" and engagement < 5:
            products.append("GIC" if rng.random() < 0.60 else "TFSA")
        # Default to TFSA — the entry-level investment account
        else:
            products.append("TFSA")
    df["best_product"] = products

    # --- LABEL 3: best_channel (multi-class) -----------------------------
    channels = []
    for i in range(n):
        age = df["age"].iloc[i]
        mobile = df["mobile_app_user"].iloc[i]
        logins = df["avg_monthly_app_logins"].iloc[i]
        email_rate = df["email_open_rate_lifetime"].iloc[i]
        prior_advisor = df["num_advisor_interactions_lifetime"].iloc[i]
        mortgage = df["has_mortgage_with_scotia"].iloc[i]
        income = df["annual_income"].iloc[i]

        # Advisor: previous advisor relationship, complex situation, high net worth
        if (prior_advisor >= 2 or mortgage == 1 or income > 90_000) and rng.random() < 0.7:
            channels.append("advisor_call")
        # In-app: young, mobile-first, frequent app users
        elif mobile == 1 and logins >= 6 and age <= 28 and rng.random() < 0.8:
            channels.append("in_app")
        # Email: opens emails, older slice
        elif email_rate > 0.30 and age >= 26 and rng.random() < 0.75:
            channels.append("email")
        # SMS: niche; lower-engagement mobile users
        elif mobile == 1 and logins < 4 and rng.random() < 0.4:
            channels.append("sms")
        # Default to in-app (most common channel)
        else:
            channels.append("in_app")
    df["best_channel"] = channels

    return df


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Generate synthetic Scotia customer data")
    parser.add_argument("--n_rows", type=int, default=250_000,
                        help="Number of synthetic customers to generate (default: 250,000)")
    parser.add_argument("--out", type=str, default="data/synthetic_scotia_customers.csv",
                        help="Output CSV path")
    args = parser.parse_args()

    print(f"Generating {args.n_rows:,} synthetic Scotia customers...")
    df = generate_features(args.n_rows)
    print(f"  → {len(df.columns)} features generated")

    print("Generating labels (will_convert_90d, best_product, best_channel)...")
    df = generate_labels(df)
    print(f"  → conversion rate: {df['will_convert_90d'].mean():.1%}")
    print(f"  → product distribution:\n{df['best_product'].value_counts(normalize=True).round(3).to_string()}")
    print(f"  → channel distribution:\n{df['best_channel'].value_counts(normalize=True).round(3).to_string()}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    size_mb = out_path.stat().st_size / 1_000_000
    print(f"\nSaved {len(df):,} rows × {len(df.columns)} columns to {out_path}")
    print(f"File size: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
