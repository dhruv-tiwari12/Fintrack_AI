# backend/finance/routes_forecast.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from backend.database.db import get_db
from backend.dependencies import get_current_user
from backend.auth.models import User
from backend.finance.models import Transaction
from backend.finance.forecast_service import (
    prepare_monthly_series,
    linear_forecast,
    predict_category_next_month,
    build_insights_payload,
)
from backend.utils.cache import Cache
from backend.utils.logger import logger

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])


@router.get("/")
def get_forecast(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Generate 6-month forecast based on user's past spending.
    Includes ML predictions + Gemini insights.
    """

    cache_key = f"forecast:{user.id}"
    cached = Cache.get(cache_key)
    if cached:
        return cached

    # Fetch transactions
    txns: List[Transaction] = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.date.asc())
        .all()
    )

    if not txns or len(txns) < 2:
        logger.warning(f"Not enough data to forecast for user {user.id}")

    return {
        "predicted_total_next_month": 0,
        "trend": [],
        "forecast": [],
        "category_predictions": {},
        "insights": [
            {
                "title": "Not Enough Data",
                "description": "Add at least two months of expense history to enable forecasting.",
                "type": "Info"
            }
        ],
    }


    # Group by month
    monthly_totals: Dict[str, float] = {}
    for t in txns:
        month_key = t.date.strftime("%Y-%m")
        monthly_totals.setdefault(month_key, 0.0)
        if t.type == "expense":
            monthly_totals[month_key] += t.amount

    # Prepare series
    monthly_items = [
        (datetime.strptime(m, "%Y-%m"), v) for m, v in sorted(monthly_totals.items())
    ]

    X, y, month_labels = prepare_monthly_series(monthly_items)

    # Predict next 6 months
    preds = linear_forecast(y, horizon=6)

    forecast_data = [
        {
            "month": (monthly_items[-1][0] + 
                      (datetime.now() - datetime.now().replace(day=1)) * 0 + 
                      (i + 1)
                     ).strftime("%b"),
            "predicted": preds[i],
        }
        for i in range(6)
    ]

    # Category-wise predictions
    category_history: Dict[str, List[float]] = {}
    for m, expense in monthly_items:
        pass  # we skip detailed category mapping for now

    category_preds = {}
    for txn in txns:
        if txn.type == "expense":
            category_preds.setdefault(txn.category, 0.0)
            category_preds[txn.category] += txn.amount

    # Simple "next month" prediction per category
    for cat, val in category_preds.items():
        category_preds[cat] = round(predict_category_next_month([val]), 2)

    total_pred = sum(v for v in category_preds.values())

    insights = build_insights_payload(
        user.id,
        total_pred,
        [{"month": m, "expenses": float(v)} for m, v in zip(month_labels, y)],
        category_preds,
    )

    response = {
        "predicted_total_next_month": total_pred,
        "trend": [{"month": m, "expenses": float(v)} for m, v in zip(month_labels, y)],
        "forecast": forecast_data,
        "category_predictions": category_preds,
        "insights": insights["insights"],
    }

    Cache.set(cache_key, response, ttl=300)
    return response