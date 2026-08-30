# AI-Powered FinTech Transaction Risk & Personal Finance Assistant

An AI-powered personal finance application that helps users track transactions, analyze spending, detect potentially fraudulent transactions, predict spending, and get personalized financial recommendations.

## Features

- Add and view financial transactions
- Track total spending and spending by category
- Analyze spending patterns
- Detect potentially fraudulent transactions using Machine Learning
- Predict spending using Machine Learning
- Generate personalized spending recommendations
- Ask financial questions through an AI assistant
- Simple and user-friendly dashboard

## Technologies Used

### Backend
- Python
- FastAPI
- SQLite
- Pandas
- NumPy
- Scikit-learn

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

## Project Structure

```text
fintech_ai_assistant/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── analytics.py
│   ├── fraud_service.py
│   ├── spending_service.py
│   ├── recommendation_service.py
│   ├── assistant_service.py
│   ├── ml_train.py
│   ├── spending_train.py
│   ├── fraud_model.pkl
│   ├── spending_model.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
