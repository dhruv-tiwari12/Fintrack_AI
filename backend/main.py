from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from backend.database.db import Base, engine
from backend.utils.logger import logger

from backend.auth.routes import router as auth_router
from backend.finance.routes_dashboard import router as dashboard_router
from backend.finance.routes_transactions import router as transactions_router
from backend.finance.routes_categories import router as categories_router
from backend.finance.routes_budgets import router as budgets_router
from backend.finance.routes_forecast import router as forecast_router
from backend.finance.routes_reports import router as reports_router

from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# ---------- Lifespan Handler ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
    yield
    logger.info("Shutting down FinTrack AI backend...")

# ---------- Create FastAPI app ----------
app = FastAPI(
    title="FinTrack AI Backend",
    description="AI-powered personal finance tracker",
    version="1.0.0",
    lifespan=lifespan
)

# ---------- CORS Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Include Routers ----------
app.include_router(auth_router)
logger.info("✅ Auth router included")

app.include_router(dashboard_router, prefix="/api/dashboard")
logger.info("✅ Dashboard router included")

# IMPORTANT: No prefix here! The router already has prefix="/api/transactions"
app.include_router(transactions_router)  
logger.info("✅ Transactions router included")

app.include_router(categories_router, prefix="/api/categories")
logger.info("✅ Categories router included")

# Budgets router **already** has prefix="/api/budgets"
app.include_router(budgets_router)
logger.info("✅ Budgets router included")

app.include_router(forecast_router)
logger.info("✅ Forecast router included")

app.include_router(reports_router)
logger.info("✅ Reports router included")


# ---------- Root & Favicon ----------
@app.get("/", summary="Welcome endpoint")
def root():
    return {"message": "Welcome to FinTrack AI!"}

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")

# ---------- Run Server ----------
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FinTrack AI FastAPI server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)