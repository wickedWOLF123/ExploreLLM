from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
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
Output format (make sure only output a valid JSON object):
{{
  "summary": Your detailed response to the user's query
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    data = json.loads(response.choices[0].message.content)
    return data