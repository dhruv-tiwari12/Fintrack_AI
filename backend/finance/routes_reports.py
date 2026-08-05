from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from dateutil.relativedelta import relativedelta

from backend.database.db import get_db
from backend.dependencies import get_current_user
from backend.auth.models import User
from backend.finance.models import Transaction
from backend.utils.cache import Cache

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    months: int = Query(6, ge=1, le=12)
):
    """
    Generates financial reports for last N months.
    Works even with one month of data.
    """

    cache_key = f"reports:{user.id}:{months}"
    cached = Cache.get(cache_key)
    if cached:
        return cached

    # -------------------------------------------
    # Load all transactions
    # -------------------------------------------
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.date.asc())
        .all()
    )

    if not txns:
        return {
            "summary": {
                "total_income": 0,
                "total_expenses": 0,
                "total_savings": 0,
                "average_monthly_savings": 0,
            },
            "monthly_overview": [],
            "savings_trend": [],
            "expense_distribution": [],
            "best_performance": {"month": None, "amount": 0},
            "next_milestone": {"target": 0, "remaining": 0},
        }


    # -------------------------------------------
    # Determine window
    # -------------------------------------------
    end_date = datetime.now().replace(day=1)
    start_date = end_date - relativedelta(months=months - 1)

    # -------------------------------------------
    # Prepare monthly buckets
    # -------------------------------------------
    month_map = {}
    cursor = start_date
    for _ in range(months):
        key = cursor.strftime("%Y-%m")
        month_map[key] = {"month": cursor.strftime("%b"), "income": 0, "expenses": 0}
        cursor += relativedelta(months=1)

    # -------------------------------------------
    # Fill monthly totals
    # -------------------------------------------
    for t in txns:
        key = t.date.strftime("%Y-%m")
        if key in month_map:
            if t.type == "income":
                month_map[key]["income"] += t.amount
            elif t.type == "expense":
                month_map[key]["expenses"] += t.amount

    # -------------------------------------------
    # Compute savings + summary
    # -------------------------------------------
    monthly_overview = []
    total_income = total_expenses = 0

    for k, v in month_map.items():
        savings = v["income"] - v["expenses"]
        v["savings"] = max(savings, 0)
        monthly_overview.append(v)

        total_income += v["income"]
        total_expenses += v["expenses"]

    total_savings = total_income - total_expenses
    avg_monthly_savings = total_savings / months if months else 0

    # -------------------------------------------
    # Expense distribution (last month only)
    # -------------------------------------------
    last_month_key = list(month_map.keys())[-1]
    last_month_date = datetime.strptime(last_month_key, "%Y-%m")

    dist = {}
    for t in txns:
        if t.type == "expense" and t.date.strftime("%Y-%m") == last_month_key:
            dist.setdefault(t.category, 0)
            dist[t.category] += t.amount

    # Convert distribution to %
    total_last_month_expense = sum(dist.values()) or 1
    expense_distribution = [
        {
            "category": cat,
            "amount": amt,
            "percent": round((amt / total_last_month_expense) * 100, 1)
        }
        for cat, amt in dist.items()
    ]

    # -------------------------------------------
    # Best performance (max savings month)
    # -------------------------------------------
    best_month = max(monthly_overview, key=lambda x: x["savings"])

    # -------------------------------------------
    # Next milestone
    # -------------------------------------------
    target = 280000  # Placeholder goal
    next_milestone = {
        "target": target,
        "remaining": max(target - total_savings, 0),
    }

    # -------------------------------------------
    # Final payload
    # -------------------------------------------
    result = {
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "total_savings": total_savings,
            "average_monthly_savings": avg_monthly_savings,
        },
        "monthly_overview": monthly_overview,
        "savings_trend": [
            {"month": m["month"], "savings": m["savings"]}
            for m in monthly_overview
        ],
        "expense_distribution": expense_distribution,
        "best_performance": {
            "month": best_month["month"],
            "amount": best_month["savings"]
        },
        "next_milestone": next_milestone,
    }

    Cache.set(cache_key, result, ttl=300)
    return result