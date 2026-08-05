"""
Forecasting service: Local ML predictions + Gemini 3 insights.
Fully corrected for Google Generative Language API + OpenAI-style fallback.
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple
import os
import json
import numpy as np
import statistics
import logging
import requests
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv

load_dotenv()

from backend.utils.cache import Cache
from backend.utils.logger import logger

if logger is None:
    logger = logging.getLogger(__name__)

# -----------------------------
# Environment
# -----------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = os.getenv(
    "GEMINI_ENDPOINT",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent"
)

CACHE_TTL = 300  # 5 minutes

# -----------------------------
# Basic ML Utilities
# -----------------------------
def prepare_monthly_series(monthly_values: List[Tuple[datetime, float]]):
    """Convert [(date, value)] → X, y, month labels."""
    if not monthly_values:
        return np.empty((0, 1)), np.empty((0,)), []

    monthly_values = sorted(monthly_values, key=lambda t: t[0])
    months = [dt for dt, _ in monthly_values]
    labels = [m.strftime("%b") for m in months]

    X = np.array([[i] for i in range(len(monthly_values))], float)
    y = np.array([float(v) for _, v in monthly_values], float)
    return X, y, labels


def linear_forecast(y: np.ndarray, horizon: int = 6) -> List[float]:
    """Linear regression for y with h-step forecast."""
    if y is None or y.size == 0:
        return [0.0] * horizon

    try:
        X = np.arange(y.size).reshape(-1, 1)
        model = LinearRegression()
        model.fit(X, y)

        future = np.arange(y.size, y.size + horizon).reshape(-1, 1)
        preds = model.predict(future)
    except Exception as e:
        logger.error(f"linear_forecast failed: {e}")
        preds = [float(y[-1])] * horizon

    return [max(0.0, float(p)) for p in preds]


def predict_category_next_month(history: List[float]) -> float:
    """Local simple ensemble model."""
    if not history:
        return 0.0

    try:
        lr_pred = linear_forecast(np.array(history, float), horizon=1)[0]
    except Exception:
        lr_pred = history[-1]

    overall = statistics.mean(history)
    recent = statistics.mean(history[-3:]) if len(history) >= 3 else overall
    season_adj = recent / overall if overall > 0 else 1.0

    pred = 0.7 * lr_pred + 0.3 * (history[-1] * season_adj)
    return float(max(0.0, pred))

# -----------------------------
# Gemini API Callers
# -----------------------------
def _call_google_generative(endpoint: str, api_key: str, prompt: str) -> str:
    """Correct Google Gemini 3 request format."""
    body = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    url = f"{endpoint}?key={api_key}"
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(url, headers=headers, json=body, timeout=12)
        resp.raise_for_status()
        data = resp.json()

        # Handle promptFeedback
        if data.get("promptFeedback", {}).get("blockReason"):
            return "Gemini blocked the prompt. Try rewriting it."

        # Extract text
        if "candidates" in data:
            cand = data["candidates"][0]
            parts = cand.get("content", {}).get("parts", [])
            if parts and "text" in parts[0]:
                return parts[0]["text"].strip()

        return ""
    except Exception as e:
        logger.error(f"Google Gemini call failed: {e}")
        return ""


def _call_openai_style(endpoint: str, api_key: str, prompt: str, model="gemini-3-pro-preview"):
    """Compatible with OpenRouter, Fireworks, etc."""
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are an AI assistant generating finance insights."},
            {"role": "user", "content": prompt},
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    try:
        resp = requests.post(endpoint, headers=headers, json=body, timeout=12)
        resp.raise_for_status()
        data = resp.json()

        choices = data.get("choices")
        if choices:
            msg = choices[0].get("message", {}).get("content")
            return msg.strip() if msg else ""

        return ""
    except Exception as e:
        logger.error(f"OpenAI-style Gemini call failed: {e}")
        return ""


def call_gemini_for_insights(prompt: str) -> str:
    """Select correct API shape automatically."""
    if not GEMINI_API_KEY:
        logger.info("Gemini key missing; skipping insights.")
        return ""

    ep = GEMINI_ENDPOINT.lower()

    if "googleapis" in ep or "generativelanguage" in ep:
        return _call_google_generative(GEMINI_ENDPOINT, GEMINI_API_KEY, prompt)
    else:
        return _call_openai_style(GEMINI_ENDPOINT, GEMINI_API_KEY, prompt)


# -----------------------------
# Insight Builder
# -----------------------------
def build_insights_payload(
    user_id: str,
    total_pred: float,
    monthly_trend: List[Dict[str, Any]],
    category_preds: Dict[str, float]
) -> Dict[str, Any]:

    cache_key = f"forecast_insights:{user_id}:{int(total_pred)}"
    cached = Cache.get(cache_key)
    if cached:
        return cached

    insights = []

    # Basic trend insight
    last_month = float(monthly_trend[-1]["expenses"]) if monthly_trend else 0.0
    change = ((total_pred - last_month) / last_month * 100) if last_month > 0 else 0.0

    if change > 8:
        insights.append({"title": "Projected Increase", "type": "High",
                         "description": f"Expenses may rise by {change:.1f}% next month."})
    elif change < -8:
        insights.append({"title": "Projected Decrease", "type": "Positive",
                         "description": f"Expenses may drop by {abs(change):.1f}% next month."})
    else:
        insights.append({"title": "Stable Spending", "type": "Info",
                         "description": f"Expenses expected to remain stable ({change:.1f}%)."})

    # Top category
    if category_preds:
        cat, amt = max(category_preds.items(), key=lambda x: x[1])
        insights.append({
            "title": f"Top Category: {cat}",
            "type": "Info",
            "description": f"{cat} expected to reach ₹{amt:.0f} next month."
        })

    # Gemini-enhanced insight
    prompt = (
        f"Monthly expenses: {monthly_trend}. "
        f"Predicted next month total: {total_pred}. "
        f"Category predictions: {category_preds}. "
        "Generate 3 insights (title + explanation) plus one recommended action."
    )

    gemini_text = call_gemini_for_insights(prompt)
    if gemini_text:
        insights.insert(0, {"title": "AI Insight", "type": "AI", "description": gemini_text})

    payload = {
        "predicted_total_next_month": float(total_pred),
        "insights": insights
    }

    Cache.set(cache_key, payload, ttl=3600)
    return payload