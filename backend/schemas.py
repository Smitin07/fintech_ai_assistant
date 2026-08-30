import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, ConfigDict, field_validator


class TransactionCreate(BaseModel):
    date: datetime.date = Field(..., description="Transaction date (YYYY-MM-DD)")
    amount: float = Field(..., gt=0, description="Transaction amount must be strictly greater than 0")
    merchant: str = Field(..., min_length=1, max_length=255, description="Merchant name cannot be empty")
    category: str = Field(..., min_length=1, max_length=100, description="Category name cannot be empty")

    @field_validator("merchant", "category")
    @classmethod
    def strip_and_validate_non_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Field cannot be blank or contain only whitespace")
        return trimmed


class TransactionResponse(BaseModel):
    id: int
    date: datetime.date
    amount: float
    merchant: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    total_spending: float
    average_transaction: float
    transaction_count: int
    category_spending: Dict[str, float]


class FraudCheckResponse(BaseModel):
    is_suspicious: bool
    risk_probability: float
    risk_level: Optional[str] = "Low"


class SpendingPredictionResponse(BaseModel):
    month: int
    predicted_spending: float
    baseline_spending: Optional[float] = None


class RecommendationsResponse(BaseModel):
    recommendations: List[str]


class AssistantResponse(BaseModel):
    answer: str