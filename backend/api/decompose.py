from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable is not set")

client = OpenAI(api_key=api_key)
router = APIRouter()

class Req(BaseModel):
    text: str
    user_context: str
    selected_options: list[str]

@router.post("/decompose")
async def decompose(req: Req):
    prompt = f"""
I want to accomplish the main goal of:{req.text}
To better assist me, please break down the problem into sub-problems.
Each sub-problem should help me to solve the original problem.
Make it so that each sub-problem is not trivial and can be helpful.
Take my context and personalization cues to personalize the sub-problems.
Make sure each sub-problem is concise and less than 15 words.

Personalization Cue:{req.selected_options}
My Context:{req.user_context}

Output format
(Make sure only output a valid JSON object
that can be parsed with JS function JSON.parse).
Do not include any '<newline>' or 'json'.
{{
  "sub_problems": A list of strings (max 8), each as a valid sub-query
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    data = json.loads(response.choices[0].message.content)
    return data