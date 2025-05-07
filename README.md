// =============================================================
// ExploreLLM‑Prototype (Depth = 2) — Monorepo layout
// Front‑end → Next.js 13  (React 18, App‑Router)
// Back‑end → FastAPI (uvicorn)  +  OpenAI SDK 1.x
// =============================================================
// Folder structure (all paths are relative to repo root)
// ├── backend/
// │   ├── main.py              ⇠ FastAPI server
// │   ├── prompts.py           ⇠ Prompt templates
// │   └── requirements.txt     ⇠ fastapi, pydantic, openai, uvicorn
// └── frontend/
//     ├── app/
//     │   ├── page.tsx         ⇠ Root page (task input + cards)
//     │   ├── [taskId]/page.tsx⇠ Sub‑task workspace
//     ├── components/
//     │   ├── TaskCard.tsx
//     │   ├── OptionList.tsx
//     │   └── PreferenceBar.tsx
//     ├── lib/api.ts           ⇠ fetch helpers (calls backend)
//     └── tailwind.config.ts
// =============================================================

// -------------------------------------------------------------
// backend/requirements.txt
// -------------------------------------------------------------
// fastapi
// uvicorn[standard]
// openai>=1.0.0
// python-dotenv
// pydantic>=2.0

// -------------------------------------------------------------
// backend/prompts.py
// -------------------------------------------------------------
from textwrap import dedent

DECOMPOSE_PROMPT = dedent("""
I want to accomplish the main goal of:{text}
To better assist me, please break down the problem into sub-problems.
Each sub-problem should help me to solve the original problem.
Make it so that each sub-problem is not trivial and can be helpful.
Take my context and personalization cues to personalize the sub-problems.
Make sure each sub-problem is concise and less than 15 words.

Personalization Cue:{selected_options}
My Context:{user_context}

Output format (Make sure only output a valid JSON object that can be parsed with JS function JSON.parse).
Do not include any ``` or json.
{{
  "sub_problems": [STRING]
}}
""")

OPTIONS_PROMPT = dedent("""
User: {text}
== Instructions ==
The user wants to: {context}
Here is one of the sub-query to help answer the main query.
Go into details to help me with the sub-query.
Show me some options to personalize and choose from.
Be concrete and make sure the options are valid choices to finish the task in sub-query.
Personalization Cue: {selected_options}
My Context: {user_context}
When coming up with options, make sure they are diverse and representative of multiple demographics, cultures, and viewpoints.
Output format (make sure only output a valid JSON object):
Do not include any '``` or json'.
{{
  "recommended": STRING,
  "options": [STRING]
}}
== End of Instruction ==
User: {text}
Output:
""")

SUMMARY_PROMPT = dedent("""
User: {text}
Your Response:
Here is some information helpful to know about the user to personalize response.
Personalization: {selected_options}
Context: {user_context}
Answer the original user query. When helpful, personalize the response.
""")

// -------------------------------------------------------------
// backend/main.py
// -------------------------------------------------------------
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import openai
import prompts

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="ExploreLLM‑API")

# ---------- Pydantic schemas ----------
class DecomposeReq(BaseModel):
    text: str
    user_context: str = ""
    selected_options: list[str] = Field(default_factory=list)

class DecomposeResp(BaseModel):
    sub_problems: list[str]

class OptionsReq(BaseModel):
    text: str          # the sub‑task text
    context: str       # original macro‑goal
    user_context: str = ""
    selected_options: list[str] = Field(default_factory=list)

class OptionsResp(BaseModel):
    recommended: str
    options: list[str]

class SummaryReq(BaseModel):
    text: str               # original macro‑goal
    user_context: str = ""
    selected_options: list[str] = Field(default_factory=list)

class SummaryResp(BaseModel):
    answer: str

# ---------- OpenAI helper ----------
async def call_openai(system_prompt: str, temperature=0.7):
    completion = await openai.chat.completions.create(
        model="gpt-4o-mini",
        temperature=temperature,
        messages=[{"role": "system", "content": system_prompt}]
    )
    return completion.choices[0].message.content

# ---------- Endpoints ----------

@app.post("/decompose", response_model=DecomposeResp)
async def decompose(req: DecomposeReq):
    prompt = prompts.DECOMPOSE_PROMPT.format(
        text=req.text,
        user_context=req.user_context,
        selected_options=", ".join(req.selected_options)
    )
    raw = await call_openai(prompt, temperature=0.3)
    try:
        data = DecomposeResp.model_validate_json(raw)
        return data
    except Exception as e:
        raise HTTPException(500, f"Parse error: {e}\nModel output: {raw}")

@app.post("/options", response_model=OptionsResp)
async def options(req: OptionsReq):
    prompt = prompts.OPTIONS_PROMPT.format(
        text=req.text,
        context=req.context,
        user_context=req.user_context,
        selected_options=", ".join(req.selected_options)
    )
    raw = await call_openai(prompt)
    try:
        data = OptionsResp.model_validate_json(raw)
        return data
    except Exception as e:
        raise HTTPException(500, f"Parse error: {e}\nModel output: {raw}")

@app.post("/summary", response_model=SummaryResp)
async def summary(req: SummaryReq):
    prompt = prompts.SUMMARY_PROMPT.format(
        text=req.text,
        user_context=req.user_context,
        selected_options=", ".join(req.selected_options)
    )
    answer = await call_openai(prompt, temperature=0.5)
    return SummaryResp(answer=answer)

# Run:  uvicorn backend.main:app --reload --port 8000

// -------------------------------------------------------------
// frontend/lib/api.ts
// -------------------------------------------------------------
export async function decompose(text: string, context = "", selected: string[] = []) {
  const res = await fetch("/api/decompose", {
    method: "POST",
    body: JSON.stringify({ text, user_context: context, selected_options: selected }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to decompose");
  return res.json();
}

export async function options(subTask: string, goal: string, context = "", selected: string[] = []) {
  const res = await fetch("/api/options", {
    method: "POST",
    body: JSON.stringify({ text: subTask, context: goal, user_context: context, selected_options: selected }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to get options");
  return res.json();
}

export async function summarize(goal: string, context = "", selected: string[] = []) {
  const res = await fetch("/api/summary", {
    method: "POST",
    body: JSON.stringify({ text: goal, user_context: context, selected_options: selected }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to summarize");
  return res.json();
}

// -------------------------------------------------------------
// frontend/components/TaskCard.tsx
// -------------------------------------------------------------
import Link from "next/link";

interface Props {
  id: string;  // slugified sub‑task
  label: string;
}
export default function TaskCard({ id, label }: Props) {
  return (
    <Link href={`/${id}`} className="block p-4 rounded-xl shadow bg-rose-100 hover:bg-rose-200 transition">
      {label}
    </Link>
  );
}

// -------------------------------------------------------------
// frontend/components/PreferenceBar.tsx
// -------------------------------------------------------------
'use client';
import { useState } from "react";

interface Props {
  preferences: string;
  onChange: (v: string) => void;
}
export default function PreferenceBar({ preferences, onChange }: Props) {
  return (
    <textarea
      className="w-full p-2 border rounded-xl"
      placeholder="Tell us about yourself…"
      value={preferences}
      onChange={e => onChange(e.target.value)}
    />
  );
}

// -------------------------------------------------------------
// frontend/components/OptionList.tsx
// -------------------------------------------------------------
'use client';
import { useState } from "react";

type Option = { text: string; checked: boolean };

interface Props {
  recommended: string;
  options: string[];
  onSelect: (sel: string[]) => void;
}
export default function OptionList({ recommended, options, onSelect }: Props) {
  const [data, setData] = useState<Option[]>([
    { text: recommended, checked: true },
    ...options.map(o => ({ text: o, checked: false })),
  ]);

  function toggle(i: number) {
    const next = data.map((o, idx) => idx === i ? { ...o, checked: !o.checked } : o);
    setData(next);
    onSelect(next.filter(o => o.checked).map(o => o.text));
  }

  return (
    <ul className="space-y-2 mt-4">
      {data.map((o, i) => (
        <li key={i} className="flex items-start gap-2">
          <input type="checkbox" checked={o.checked} onChange={() => toggle(i)} />
          <span>{o.text}</span>
        </li>
      ))}
    </ul>
  );
}

// -------------------------------------------------------------
// frontend/app/page.tsx  (root)
// -------------------------------------------------------------
import { decompose } from "../lib/api";
import TaskCard from "../components/TaskCard";
import PreferenceBar from "../components/PreferenceBar";
import { Suspense, useState } from "react";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [subs, setSubs] = useState<string[]>([]);
  const [prefs, setPrefs] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { sub_problems } = await decompose(goal, prefs);
    setSubs(sub_problems);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">ExploreLLM Prototype</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={goal} onChange={e => setGoal(e.target.value)}
          className="flex-1 p-2 border rounded-xl" placeholder="I want to…" />
        <button className="bg-black text-white px-4 rounded-xl">Decompose</button>
      </form>

      <PreferenceBar preferences={prefs} onChange={setPrefs} />

      {subs.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.map((s, idx) => (
            <TaskCard key={idx} id={`task-${idx}`} label={s} />
          ))}
        </section>
      )}
    </main>
  );
}

// -------------------------------------------------------------
// frontend/app/[taskId]/page.tsx  (sub‑task workspace — depth 1)
// -------------------------------------------------------------
import { options, summarize } from "../../lib/api";
import { Suspense, useEffect, useState } from "react";
import OptionList from "../../components/OptionList";
import Link from "next/link";

export default function TaskPage({ params }: { params: { taskId: string } }) {
  const subTask = decodeURIComponent(params.taskId.replace("task-", ""));
  const [goal] = useState(typeof window !== "undefined" ? localStorage.getItem("goal") ?? "" : "");
  const [prefs, setPrefs] = useState(localStorage.getItem("prefs") ?? "");
  const [opts, setOpts] = useState<{ recommended: string; options: string[] } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    options(subTask, goal, prefs).then(setOpts);
  }, []);

  async function handleSummarize() {
    const { answer } = await summarize(goal, prefs, selected);
    setSummary(answer);
  }

  if (!opts) return <p>Loading…</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/" className="text-sm text-blue-600">← Back to all tasks</Link>
      <h2 className="text-xl font-semibold">{subTask}</h2>

      <OptionList recommended={opts.recommended} options={opts.options} onSelect={setSelected} />

      <button onClick={handleSummarize} className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl">Summarize</button>

      {summary && (
        <article className="prose lg:prose-lg border p-4 rounded-xl bg-gray-50">
          {summary}
        </article>
      )}
    </main>
  );
}

// -------------------------------------------------------------
// .env  (put in repo root, never commit!)
// -------------------------------------------------------------
// OPENAI_API_KEY=sk-...

// =============================================================
// Usage notes
// =============================================================
// 1)  cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
// 2)  cd frontend && npm install && npm run dev  (Next.js server on port 3000)
// 3)  Proxy Next.js API routes to :8000  (see next.config.js)
// 4)  Depth stays at 2 — the frontend only routes root and one‑level children.
// 5)  Extend by adding persistent DB for tasks & selected options instead of localStorage.
// =============================================================
