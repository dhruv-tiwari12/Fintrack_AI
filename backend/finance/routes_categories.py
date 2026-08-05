from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timedelta
from calendar import month_abbr

from backend.database.db import get_db
from backend.dependencies import get_current_user
from backend.auth.models import User
from backend.finance.models import Transaction, UserProfile, TransactionType
from backend.finance.schemas import (
    DashboardSummary,
    DashboardStats,
    CategoryBreakdown,
    MonthlyData,
    TransactionOut,
    UserProfileOut,
    UserProfileCreate,
    UserProfileUpdate,
    AIInsightsResponse,
    AIInsight,
    InsightType,
)
from backend.utils.cache import Cache, get_cache_key
from backend.utils.logger import logger
import uuid

router = APIRouter(tags=["Dashboard"])


# ==================== USER PROFILE MANAGEMENT ====================
@router.post("/profile", response_model=UserProfileOut, status_code=201)
def create_user_profile(
    profile: UserProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create user financial profile"""
    logger.info(f"Creating profile for user {current_user.id}")

    # Check if profile already exists
    existing = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")

    new_profile = UserProfile(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        initial_balance=profile.initial_balance,
        monthly_budget=profile.monthly_budget,
        currency=profile.currency,
    )

    try:
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        Cache.clear_user_cache(current_user.id)
        logger.info(f"✅ Profile created for user {current_user.id}")
        return new_profile

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to create profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")


@router.get("/profile", response_model=UserProfileOut)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user financial profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create one first."
        )

    return profile


@router.put("/profile", response_model=UserProfileOut)
def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user financial profile"""
    logger.info(f"Updating profile for user {current_user.id}")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    try:
        db.commit()
        db.refresh(profile)

        Cache.clear_user_cache(current_user.id)
        logger.info(f"✅ Profile updated for user {current_user.id}")
        return profile

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to update profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


# ==================== DASHBOARD SUMMARY ====================
@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get complete dashboard summary with stats, charts, and recent transactions"""
    logger.info(f"Fetching dashboard summary for user {current_user.id}")

    # Check cache
    cache_key = get_cache_key(current_user.id, "dashboard_summary")
    cached = Cache.get(cache_key)
    if cached:
        return cached

    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please create a profile first."
        )

    # Date ranges
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(seconds=1)

    # ========== CURRENT MONTH STATS ==========
    current_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.INCOME,
        Transaction.date >= current_month_start,
    ).scalar() or 0.0

    current_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= current_month_start,
    ).scalar() or 0.0

    # ========== LAST MONTH STATS (for comparison) ==========
    last_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.INCOME,
        Transaction.date >= last_month_start,
        Transaction.date <= last_month_end,
    ).scalar() or 0.0

    last_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= last_month_start,
        Transaction.date <= last_month_end,
    ).scalar() or 0.0

    # Calculate total balance
    all_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.INCOME,
    ).scalar() or 0.0

    all_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
    ).scalar() or 0.0

    total_balance = profile.initial_balance + all_income - all_expenses
    budget_left = profile.monthly_budget - current_expenses

    # Calculate percentage changes
    income_change = ((current_income - last_income) / last_income * 100) if last_income > 0 else 0
    expense_change = ((current_expenses - last_expenses) / last_expenses * 100) if last_expenses > 0 else 0
    budget_usage = (current_expenses / profile.monthly_budget * 100) if profile.monthly_budget > 0 else 0

    stats = DashboardStats(
        total_balance=round(total_balance, 2),
        total_income=round(current_income, 2),
        total_expenses=round(current_expenses, 2),
        budget_left=round(budget_left, 2),
        income_change_percent=round(income_change, 2),
        expense_change_percent=round(expense_change, 2),
        budget_usage_percent=round(budget_usage, 2),
    )

    # ========== CATEGORY BREAKDOWN ==========
    category_data = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= current_month_start,
    ).group_by(Transaction.category).all()

    category_colors = {
        "Food & Dining": "#10b981",
        "Transportation": "#3b82f6",
        "Shopping": "#8b5cf6",
        "Bills & Utilities": "#f59e0b",
        "Entertainment": "#ec4899",
        "Healthcare": "#ef4444",
        "Education": "#06b6d4",
        "Other": "#6b7280",
    }

    category_breakdown = []
    for cat, amount in category_data:
        percentage = (amount / current_expenses * 100) if current_expenses > 0 else 0
        category_breakdown.append(
            CategoryBreakdown(
                category=cat,
                amount=round(amount, 2),
                percentage=round(percentage, 2),
                color=category_colors.get(cat, "#6b7280"),
            )
        )

    # ========== MONTHLY TREND (Last 6 months) ==========
    monthly_trend = []
    for i in range(5, -1, -1):
        month_start = (current_month_start - timedelta(days=30 * i)).replace(day=1)
        next_month = (month_start + timedelta(days=32)).replace(day=1)

        month_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.INCOME,
            Transaction.date >= month_start,
            Transaction.date < next_month,
        ).scalar() or 0.0

        month_expenses = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.date >= month_start,
            Transaction.date < next_month,
        ).scalar() or 0.0

        monthly_trend.append(
            MonthlyData(
                month=month_abbr[month_start.month],
                income=round(month_income, 2),
                expenses=round(month_expenses, 2),
            )
        )

    # ========== RECENT TRANSACTIONS ==========
    recent_transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.date.desc())
        .limit(10)
        .all()
    )

    # Build response
    summary = DashboardSummary(
        stats=stats,
        category_breakdown=category_breakdown,
        monthly_trend=monthly_trend,
        recent_transactions=[TransactionOut.from_orm(t) for t in recent_transactions],
    )

    # Cache for 2 minutes
    Cache.set(cache_key, summary.dict(), ttl=120)

    logger.info(f"✅ Dashboard summary fetched for user {current_user.id}")
    return summary


# ==================== AI INSIGHTS ====================
@router.get("/insights", response_model=AIInsightsResponse)
def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate AI-powered financial insights"""
    logger.info(f"Generating AI insights for user {current_user.id}")

    # Check cache
    cache_key = get_cache_key(current_user.id, "ai_insights")
    cached = Cache.get(cache_key)
    if cached:
        return cached

    # Get current month data
    now = datetime.utcnow()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        return AIInsightsResponse(insights=[])

    current_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= current_month_start,
    ).scalar() or 0.0

    # Get category spending
    category_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= current_month_start,
    ).group_by(Transaction.category).all()

    insights = []

    # Insight 1: Budget status
    budget_left = profile.monthly_budget - current_expenses
    if budget_left < 0:
        insights.append(AIInsight(
            title="Budget Exceeded!",
            description=f"You've exceeded your monthly budget by ₹{abs(budget_left):.0f}. Consider reducing discretionary spending.",
            type=InsightType.HIGH,
            icon="⚠️"
        ))
    elif budget_left < profile.monthly_budget * 0.2:
        insights.append(AIInsight(
            title="Budget Alert",
            description=f"Only ₹{budget_left:.0f} left in your budget. Monitor your spending carefully.",
            type=InsightType.MEDIUM,
            icon="📊"
        ))
    else:
        insights.append(AIInsight(
            title="Great Savings!",
            description=f"You're ₹{budget_left:.0f} under budget this month. Perfect time to boost your emergency fund!",
            type=InsightType.POSITIVE,
            icon="🎉"
        ))

    # Insight 2: Top spending category
    if category_spending:
        top_category = max(category_spending, key=lambda x: x.total)
        percentage = (top_category.total / current_expenses * 100) if current_expenses > 0 else 0
        
        if percentage > 40:
            insights.append(AIInsight(
                title=f"High {top_category.category} Spending",
                description=f"You've spent {percentage:.0f}% of your expenses on {top_category.category}. Consider ways to reduce this category.",
                type=InsightType.HIGH,
                icon="🍽️" if "Food" in top_category.category else "💳"
            ))

    # Cache for 1 hour
    response = AIInsightsResponse(insights=insights)
    Cache.set(cache_key, response.dict(), ttl=3600)

    logger.info(f"✅ Generated {len(insights)} insights for user {current_user.id}")
    return response