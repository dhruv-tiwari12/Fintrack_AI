"""
Budget Routes (backend.finance)
Handles creation, retrieval, update, and deletion of user budgets.
Includes Redis caching and structured logging.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from redis import Redis
from uuid import uuid4
import json

from backend.database.db import get_db
from backend.auth.models import User
from backend.dependencies import get_current_user
from backend.finance.models import Budget
from backend.finance.schemas import (
    BudgetCreate,
    BudgetOut,
    BudgetUpdate
)
from backend.utils.logger import logger

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

redis_client = Redis(host="localhost", port=6379, db=0, decode_responses=True)
CACHE_TTL = 60  # seconds

def serialize_budget(budget: Budget):
    data = BudgetOut.model_validate(budget).model_dump()
    # Convert ALL datetime fields to ISO strings
    for field in ["start_date", "end_date", "created_at", "updated_at"]:
        if field in data and hasattr(data[field], "isoformat"):
            data[field] = data[field].isoformat()
    return data


# =========================
# CREATE BUDGET
# =========================
@router.post("/", response_model=BudgetOut)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    logger.info(f"Creating budget for {user.email}: {payload.category} → ₹{payload.limit_amount}")

    try:
        new_budget = Budget(
            id=str(uuid4()),
            user_id=user.id,
            category=payload.category,
            limit_amount=payload.limit_amount,
            period=payload.period,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )

        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)

        redis_client.delete(f"budgets:{user.id}")

        logger.info(f"Budget created for {user.email}")
        return new_budget

    except Exception as e:
        logger.error(f"Failed to create budget: {e}")
        raise HTTPException(status_code=500, detail="Failed to create budget")


# =========================
# GET ALL BUDGETS
# =========================
@router.get("/", response_model=list[BudgetOut])
def get_budgets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cache_key = f"budgets:{user.id}"
    cached = redis_client.get(cache_key)

    if cached:
        logger.info(f"Cache hit for budgets of {user.email}")
        return json.loads(cached)

    logger.info(f"Cache miss: loading budgets for {user.email}")

    budgets = db.query(Budget).filter(Budget.user_id == user.id).all()

    serialized = [serialize_budget(b) for b in budgets]

    redis_client.setex(cache_key, CACHE_TTL, json.dumps(serialized))

    return serialized


# =========================
# UPDATE BUDGET
# =========================
@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: str,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user.id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    update_data = payload.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(budget, field, value)

    try:
        db.commit()
        db.refresh(budget)

        redis_client.delete(f"budgets:{user.id}")

        logger.info(f"Budget updated for {user.email}")
        return budget

    except Exception as e:
        logger.error(f"Failed to update budget: {e}")
        raise HTTPException(status_code=500, detail="Failed to update budget")


# =========================
# DELETE BUDGET
# =========================
@router.delete("/{budget_id}")
def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == user.id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    try:
        db.delete(budget)
        db.commit()

        redis_client.delete(f"budgets:{user.id}")

        logger.info(f"Budget deleted for {user.email}")
        return {"message": "Budget deleted successfully"}

    except Exception as e:
        logger.error(f"Failed to delete budget: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete budget")