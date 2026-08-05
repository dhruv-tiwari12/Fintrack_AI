from fastapi import APIRouter
from backend.finance.routes_transactions import router as transactions_router
from backend.finance.routes_dashboard import router as dashboard_router
from backend.finance.routes_categories import router as categories_router
from backend.finance.routes_budgets import router as budgets_router

# Create a main finance router
finance_router = APIRouter()

# Include all sub-routers
finance_router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
finance_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
finance_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
finance_router.include_router(budgets_router, prefix="/budgets", tags=["Budgets"])
