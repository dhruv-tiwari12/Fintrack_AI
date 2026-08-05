from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.db import get_db
from backend.dependencies import get_current_user
from backend.auth.models import User
from backend.finance.models import Category, TransactionType
from backend.finance.schemas import CategoryCreate, CategoryOut
from backend.utils.logger import logger

router = APIRouter(prefix="/categories", tags=["Categories"])


# ==================== INITIALIZE DEFAULT CATEGORIES ====================
def initialize_default_categories(db: Session):
    """Create system default categories if they don't exist"""
    default_categories = [
        # Expense categories
        {"name": "Food & Dining", "type": TransactionType.EXPENSE, "color": "#10b981", "icon": "🍽️"},
        {"name": "Transportation", "type": TransactionType.EXPENSE, "color": "#3b82f6", "icon": "🚗"},
        {"name": "Shopping", "type": TransactionType.EXPENSE, "color": "#8b5cf6", "icon": "🛍️"},
        {"name": "Bills & Utilities", "type": TransactionType.EXPENSE, "color": "#f59e0b", "icon": "💡"},
        {"name": "Entertainment", "type": TransactionType.EXPENSE, "color": "#ec4899", "icon": "🎬"},
        {"name": "Healthcare", "type": TransactionType.EXPENSE, "color": "#ef4444", "icon": "🏥"},
        {"name": "Education", "type": TransactionType.EXPENSE, "color": "#06b6d4", "icon": "📚"},
        {"name": "Other", "type": TransactionType.EXPENSE, "color": "#6b7280", "icon": "📦"},
        
        # Income categories
        {"name": "Salary", "type": TransactionType.INCOME, "color": "#10b981", "icon": "💰"},
        {"name": "Investment", "type": TransactionType.INCOME, "color": "#3b82f6", "icon": "📈"},
        {"name": "Other Income", "type": TransactionType.INCOME, "color": "#6b7280", "icon": "💵"},
    ]

    for cat_data in default_categories:
        # Check if category already exists
        existing = db.query(Category).filter(
            Category.name == cat_data["name"],
            Category.is_system == "true"
        ).first()

        if not existing:
            new_category = Category(
                id=str(uuid.uuid4()),
                user_id=None,  # System category
                name=cat_data["name"],
                type=cat_data["type"],
                color=cat_data["color"],
                icon=cat_data["icon"],
                is_system="true",
            )
            db.add(new_category)

    try:
        db.commit()
        logger.info("✅ Default categories initialized")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to initialize default categories: {e}")


# ==================== GET ALL CATEGORIES ====================
@router.get("/", response_model=List[CategoryOut])
def get_categories(
    type: str = None,  # "income" or "expense"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all categories (system + user custom categories)"""
    logger.info(f"Fetching categories for user {current_user.id}")

    # Initialize default categories if needed
    initialize_default_categories(db)

    # Get system categories and user's custom categories
    query = db.query(Category).filter(
        (Category.user_id == None) | (Category.user_id == current_user.id)
    )

    if type:
        query = query.filter(Category.type == type)

    categories = query.order_by(Category.is_system.desc(), Category.name).all()

    logger.info(f"✅ Fetched {len(categories)} categories")
    return categories


# ==================== CREATE CUSTOM CATEGORY ====================
@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a custom category"""
    logger.info(f"Creating custom category for user {current_user.id}")

    # Check if category name already exists for this user
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == category.name,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")

    new_category = Category(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=category.name,
        type=category.type,
        color=category.color,
        icon=category.icon,
        is_system="false",
    )

    try:
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        logger.info(f"✅ Custom category created: {new_category.id}")
        return new_category

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to create category: {e}")
        raise HTTPException(status_code=500, detail="Failed to create category")


# ==================== DELETE CUSTOM CATEGORY ====================
@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a custom category (cannot delete system categories)"""
    logger.info(f"Deleting category {category_id}")

    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id,
    ).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.is_system == "true":
        raise HTTPException(status_code=403, detail="Cannot delete system categories")

    try:
        db.delete(category)
        db.commit()

        logger.info(f"✅ Category deleted: {category_id}")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Failed to delete category: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete category")