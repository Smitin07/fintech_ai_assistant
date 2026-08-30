from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Transaction


def get_analytics(db: Session):
    total = db.query(func.sum(Transaction.amount)).scalar() or 0
    average = db.query(func.avg(Transaction.amount)).scalar() or 0
    count = db.query(func.count(Transaction.id)).scalar() or 0

    category_data = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        )
        .group_by(Transaction.category)
        .all()
    )

    category_spending = {
        category: float(total)
        for category, total in category_data
    }

    return {
        "total_spending": float(total),
        "average_transaction": float(average),
        "transaction_count": count,
        "category_spending": category_spending
    }
