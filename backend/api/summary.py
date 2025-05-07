from fastapi import APIRouter
from pydantic import BaseModel
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")
router = APIRouter()

class Req(BaseModel):
    text: str
    user_context: str
    selected_options: list[str]

@router.post("/summary")
async def summary(req: Req):
    prompt = f"""
User: {req.text}
Your Response:
Here is some information helpful to know about the user to personalize response.
Personalization: {req.selected_options}
Context: {req.user_context}
Answer the original user query. When helpful, personalize the response.
"""
    res = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}]
    )
    return {"summary": res.choices[0].message.content.strip()}