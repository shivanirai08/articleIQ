"""Demo prompt builder for Checkpoint 9 LLM integration test."""


def build_demo_user_prompt(user_message: str) -> str:
    """Wrap the user's message for the integration demo endpoint.

    Prompt engineering technique: Task framing
      - Tell the model exactly what format and scope you want.
    """
    return (
        "The user is testing the ArticleIQ LLM integration.\n\n"
        f"User message: {user_message.strip()}\n\n"
        "Reply in 2-4 sentences. If they ask about NLP or news analysis, "
        "give a helpful educational answer."
    )
