# backend/finance/schemas.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


# ==================== USER PROFILE SCHEMAS ====================
class UserProfileCreate(BaseModel):
    initial_balance: float = Field(..., description="Starting balance")
    monthly_budget: float = Field(..., description="Monthly budget limit")
    currency: str = Field(default="INR", description="Currency code")


class UserProfileUpdate(BaseModel):
    initial_balance: Optional[float] = None
    monthly_budget: Optional[float] = None
    currency: Optional[str] = None


class UserProfileOut(BaseModel):
    id: str
    user_id: str
    initial_balance: float
    monthly_budget: float
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== TRANSACTION SCHEMAS ====================
class TransactionCreate(BaseModel):
    type: TransactionType
    description: str = Field(..., min_length=1, max_length=200)
    category: str
    amount: float = Field(..., gt=0, description="Amount must be positive")
    date: Optional[datetime] = None  # If not provided, use current datetime


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[datetime] = None


class TransactionOut(BaseModel):
    id: str
    user_id: str
    type: TransactionType
    description: str
    category: str
    amount: float
    date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== CATEGORY SCHEMAS ====================
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    type: TransactionType
    color: str = Field(default="#10b981", pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class CategoryOut(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    type: TransactionType
    color: str
    icon: Optional[str]
    is_system: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== DASHBOARD SCHEMAS ====================
class DashboardStats(BaseModel):
    total_balance: float
    total_income: float
    total_expenses: float
    budget_left: float
    income_change_percent: float  # Compared to last month
    expense_change_percent: float  # Compared to last month
    budget_usage_percent: float  # Percentage of budget used


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str


class MonthlyData(BaseModel):
    month: str  # e.g., "Jan", "Feb"
    income: float
    expenses: float


class DashboardSummary(BaseModel):
    stats: DashboardStats
    category_breakdown: List[CategoryBreakdown]
    monthly_trend: List[MonthlyData]
    recent_transactions: List[TransactionOut]


# ==================== AI INSIGHTS SCHEMAS ====================
class InsightType(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    POSITIVE = "Positive"
    INFO = "Info"


class AIInsight(BaseModel):
    title: str
    description: str
    type: InsightType
    icon: str  # emoji or icon name


class AIInsightsResponse(BaseModel):
    insights: List[AIInsight]


# ==================== BUDGET SCHEMAS ====================
class BudgetCreate(BaseModel):
    category: str
    limit_amount: float = Field(..., gt=0)
    period: str = Field(default="monthly", pattern="^(monthly|yearly)$")
    start_date: datetime
    end_date: datetime


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit_amount: Optional[float] = Field(None, gt=0)
    period: Optional[str] = Field(None, pattern="^(monthly|yearly)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BudgetOut(BaseModel):
    id: str
    user_id: str
    category: str
    limit_amount: float
    period: str
    spent_amount: float
    start_date: datetime
    end_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True