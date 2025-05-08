from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
from openai import OpenAI
from typing import Optional

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter()

class Req(BaseModel):
    text: str
    context: Optional[str] = ''
    user_context: str
    selected_options: list[str]

@router.post("/options")
async def options(req: Req):
    prompt = f"""
User: {req.text}
== Instructions ==
The user wants to: {req.context}
Here is one of the sub-query to help answer the main query.
Go into details to help me with the sub-query.
Show me some options to personalize and choose from.
Be concrete and make sure the options are valid choices to finish the task in sub-query.
Personalization Cue: {req.selected_options}
My Context: {req.user_context}
When coming up with options, make sure they are diverse and representative of multiple demographics, cultures, and viewpoints.
Output format (make sure only output a valid JSON object):
Do not include any '<newline>' or 'json'.
{{
  "recommended": Your recommendation,
  "options": A list of options (at least 5) for me to choose from. Each option is a single string. Provide helpful details.
}}
== End of Instruction ==
User: {req.text}
Output:
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    data = json.loads(response.choices[0].message.content)
    return data