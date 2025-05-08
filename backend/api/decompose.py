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
    res = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    tasks = res.choices[0].message.content.strip().split("\n")
    return {"sub_problems": tasks}