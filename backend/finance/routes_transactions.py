# backend/finance/routes_transactions.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from backend.database.db import get_db
from backend.dependencies import get_current_user
from backend.auth.models import User
from backend.finance.models import Transaction, TransactionType, Budget
from backend.finance.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
)
from backend.utils.cache import Cache, get_cache_key
from backend.utils.logger import logger

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


# ======================================================
# 🔥 UPDATE BUDGET WHEN EXPENSE OCCURS
# ======================================================
def update_budget_after_expense(db: Session, transaction: Transaction):
    """Updates spent_amount when expense is added"""
    if transaction.type != TransactionType.EXPENSE:
        return

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == transaction.user_id,
            Budget.category == transaction.category
        )
        .first()
    )

    if not budget:
        logger.info(f"No budget found for category {transaction.category}")
        return

    budget.spent_amount += transaction.amount
    db.commit()
    db.refresh(budget)

    # Invalidate budget cache
    from backend.finance.routes_budgets import redis_client
    redis_client.delete(f"budgets:{transaction.user_id}")

    logger.info(
        f"Budget updated: {budget.category} {budget.spent_amount}/{budget.limit_amount}"
    )


def revert_budget_after_delete(db: Session, transaction: Transaction):
    """Revert spent_amount when an expense is deleted"""
    if transaction.type != TransactionType.EXPENSE:
        return

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == transaction.user_id,
            Budget.category == transaction.category
        )
        .first()
    )

    if not budget:
        return

    # prevent negative spent
    budget.spent_amount = max(0, budget.spent_amount - transaction.amount)
    db.commit()

    from backend.finance.routes_budgets import redis_client
    redis_client.delete(f"budgets:{transaction.user_id}")


# ======================================================
# CREATE TRANSACTION
# ======================================================
@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(f"Creating transaction for {current_user.id}")

    new_transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=transaction.type,
        description=transaction.description,
        category=transaction.category,
        amount=transaction.amount,
        date=transaction.date or datetime.utcnow(),
    )

    try:
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        # update budgets if required
        update_budget_after_expense(db, new_transaction)

        Cache.clear_user_cache(current_user.id)

        return TransactionOut.from_orm(new_transaction)

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to create transaction")


# ======================================================
# GET ALL TRANSACTIONS
# ======================================================
@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(f"Fetching transactions for {current_user.id}")

    cache_key = get_cache_key(
        current_user.id,
        "transactions",
        skip,
        limit,
        type or "all",
        category or "all",
        str(start_date) if start_date else "none",
        str(end_date) if end_date else "none",
    )

    cached = Cache.get(cache_key)
    if cached:
        logger.info("Transactions served from cache")
        return cached

    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()

    result = [TransactionOut.from_orm(t).model_dump() for t in transactions]

    Cache.set(cache_key, result, ttl=300)

    return [TransactionOut.from_orm(t) for t in transactions]


# ======================================================
# GET SINGLE TRANSACTION
# ======================================================
@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return TransactionOut.from_orm(transaction)


# ======================================================
# UPDATE TRANSACTION
# ======================================================
@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = transaction_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(transaction, field, value)

    try:
        db.commit()
        db.refresh(transaction)

        Cache.clear_user_cache(current_user.id)

        return TransactionOut.from_orm(transaction)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update transaction")


# ======================================================
# DELETE TRANSACTION
# ======================================================
@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        revert_budget_after_delete(db, transaction)

        db.delete(transaction)
        db.commit()

        Cache.clear_user_cache(current_user.id)

        logger.info(f"Deleted transaction {transaction_id}")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete transaction")