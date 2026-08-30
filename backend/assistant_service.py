import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


def ask_assistant(question: str) -> str:
    if not client or not os.getenv("OPENAI_API_KEY"):
        return "OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful and knowledgeable AI personal finance assistant."
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"Error communicating with AI assistant: {str(e)}"