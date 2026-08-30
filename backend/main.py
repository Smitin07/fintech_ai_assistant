import os
from datetime import date
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import engine, Base, get_db
from models import Transaction
from schemas import (
    TransactionCreate,
    TransactionResponse,
    AnalyticsResponse,
    FraudCheckResponse,
    SpendingPredictionResponse,
    RecommendationsResponse,
    AssistantResponse,
)
from analytics import get_analytics
from fraud_service import predict_fraud
from spending_service import predict_spending
from recommendation_service import generate_recommendations
from assistant_service import ask_assistant

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables safely on application startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="FinTech AI Assistant",
    description="AI-Powered FinTech Transaction Risk & Personal Finance Assistant API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS with environment variable support and sensible local fallbacks
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
if cors_origins_raw.strip():
    origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def home():
    return {"message": "FinTech AI Assistant is running"}


@app.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED, tags=["Transactions"])
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):
    try:
        new_transaction = Transaction(
            date=transaction.date,
            amount=transaction.amount,
            merchant=transaction.merchant,
            category=transaction.category
        )
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return new_transaction
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save transaction to database."
        )



@app.get("/transactions", response_model=List[TransactionResponse], tags=["Transactions"])
def get_transactions(
    skip: int = Query(0, ge=0, description="Number of records to skip (offset)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    category: Optional[str] = Query(None, description="Filter transactions by category"),
    start_date: Optional[date] = Query(None, description="Filter transactions on or after this date"),
    end_date: Optional[date] = Query(None, description="Filter transactions on or before this date"),
    min_amount: Optional[float] = Query(None, ge=0, description="Filter transactions with minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0, description="Filter transactions with maximum amount"),
    db: Session = Depends(get_db)
):
    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_amount cannot be greater than max_amount."
        )

    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date cannot be after end_date."
        )

    query = db.query(Transaction)

    if category:
        query = query.filter(Transaction.category.ilike(f"%{category.strip()}%"))
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    return query.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(skip).limit(limit).all()


@app.get("/analytics", response_model=AnalyticsResponse, tags=["Analytics"])
def analytics(db: Session = Depends(get_db)):
    try:
        return get_analytics(db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate spending analytics."
        )


@app.get("/fraud-check", response_model=FraudCheckResponse, tags=["Machine Learning"])
def fraud_check(
    amount: float = Query(..., gt=0, description="Transaction amount must be strictly greater than 0"),
    hour: int = Query(..., ge=0, le=23, description="Hour of transaction must be between 0 and 23"),
    category: Optional[str] = Query("General", description="Transaction category"),
    merchant_risk: Optional[float] = Query(0.1, ge=0.0, le=1.0, description="Merchant risk score between 0.0 and 1.0"),
    transaction_type: Optional[str] = Query("Online", description="Transaction channel (Online, POS, ATM, Transfer)"),
    velocity_last_24h: Optional[int] = Query(1, ge=0, description="Number of transactions in the last 24 hours"),
    is_international: Optional[int] = Query(0, ge=0, le=1, description="International transaction flag (0 or 1)")
):
    try:
        return predict_fraud(
            amount=amount,
            hour=hour,
            category=category or "General",
            merchant_risk=merchant_risk if merchant_risk is not None else 0.1,
            transaction_type=transaction_type or "Online",
            velocity_last_24h=velocity_last_24h if velocity_last_24h is not None else 1,
            is_international=is_international if is_international is not None else 0
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run fraud detection inference."
        )


@app.get("/spending-prediction", response_model=SpendingPredictionResponse, tags=["Machine Learning"])
def spending_prediction(
    month: int = Query(..., ge=1, le=12, description="Month must be between 1 and 12"),
    prev_month_spending: Optional[float] = Query(None, ge=0, description="Previous month spending amount"),
    avg_spending_3m: Optional[float] = Query(None, ge=0, description="3-month moving average spending"),
    transaction_count: Optional[int] = Query(None, ge=0, description="Previous month transaction count"),
    discretionary_ratio: Optional[float] = Query(None, ge=0.0, le=1.0, description="Discretionary spending ratio (0.0 to 1.0)"),
    db: Session = Depends(get_db)
):
    try:
        return predict_spending(
            month=month,
            prev_month_spending=prev_month_spending,
            avg_spending_3m=avg_spending_3m,
            transaction_count=transaction_count,
            discretionary_ratio=discretionary_ratio,
            db=db
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run spending prediction inference."
        )


@app.get("/recommendations", response_model=RecommendationsResponse, tags=["Recommendations"])
def recommendations(db: Session = Depends(get_db)):
    try:
        analytics_data = get_analytics(db)
        return {
            "recommendations": generate_recommendations(analytics_data)
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate financial recommendations."
        )



@app.get("/assistant", response_model=AssistantResponse, tags=["AI Assistant"])
def assistant(
    question: str = Query(..., min_length=1, description="Question for the AI financial assistant")
):
    cleaned_question = question.strip()
    if not cleaned_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question parameter cannot be blank."
        )
    return {
        "answer": ask_assistant(cleaned_question)
    }