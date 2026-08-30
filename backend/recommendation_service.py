def generate_recommendations(analytics):
    recommendations = []

    total = analytics["total_spending"]
    categories = analytics["category_spending"]

    if total == 0:
        return ["Start adding transactions to receive financial insights."]

    # Find highest spending category
    if categories:
        highest_category = max(categories, key=categories.get)
        highest_amount = categories[highest_category]

        percentage = (highest_amount / total) * 100

        if percentage > 40:
            recommendations.append(
                f"{highest_category} accounts for {percentage:.1f}% "
                f"of your spending. Consider reducing this expense."
            )

    # General spending advice
    if total > 20000:
        recommendations.append(
            "Your total spending is relatively high. "
            "Consider setting a monthly spending budget."
        )

    if total <= 20000:
        recommendations.append(
            "Your spending is currently within a reasonable range. "
            "Continue tracking your expenses regularly."
        )

    return recommendations