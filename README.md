# ExploreLLM‑Prototype

This is a full-stack implementation of a **two-layer task decomposition interface** inspired by the paper:

> **Beyond Chatbots: ExploreLLM for Structured Thoughts and Personalized Model Responses** (2024)

ExploreLLM proposes a new interaction paradigm for large language models, where a user's complex query is broken down into manageable sub-tasks using LLM-based prompt engineering. Each sub-task is displayed as an interactive "card" in a graphical user interface (GUI), allowing users to explore, refine, and personalize parts of their goal more effectively than with traditional linear chatbots.

---

## 🎯 Key Concepts from the Paper

- **Prompt-based task decomposition:**
  - The system uses a prompt to split a complex user query into up to 8 personalized sub-tasks.

- **Card-based GUI:**
  - Each sub-task is rendered as a clickable card, helping users visually track the structure of their plan.

- **Node-based interaction design:**
  - Internally, the system models the interaction as a tree of nodes (max depth=2 in this prototype), where:
    - Root node = main user goal
    - Child nodes = generated sub-tasks

- **Personalization inputs:**
  - A dedicated UI allows users to input preferences (e.g., "I like art and ramen") that influence all prompts.

- **Options UI:**
  - For each sub-task, the system provides diverse actionable suggestions (using another prompt) and allows implicit feedback via checkbox selection.

- **Summarization:**
  - A summary function combines all selected options and user context into a final personalized response.

---

## 📁 Project Structure

```bash
ExploreLLM-Prototype/
├── backend/                 # FastAPI server
│   ├── main.py              # API endpoints
│   ├── prompts.py           # Decomposition, Options, and Summary prompts
│   └── requirements.txt     # Python dependencies
├── frontend/                # Next.js 13 UI
│   ├── app/                 # Pages and routes
│   ├── components/          # Reusable UI components
│   ├── lib/api.ts           # API helper functions
│   └── tailwind.config.ts   # Tailwind CSS
└── .env                     # API keys (not committed)
```

---

## 🚀 Getting Started

### 1. Back-end (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Front-end (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Access the app at [http://localhost:3000](http://localhost:3000)

> **Note:** Ensure you have `OPENAI_API_KEY=sk-...` in a `.env` file at the root level.

---

## 🛠 Built With
- **FastAPI** (Python)
- **OpenAI GPT-4o-mini API**
- **Next.js 13 + Tailwind CSS**
- **MongoDB** (optional for deeper node storage)

---

## 📚 Future Work
- Support for depth >2 (nested subtasks)
- Persistent user session history
- Switchable LLM backends (Claude, Gemini)
- Cost-optimization using tiered models (e.g., GPT‑3.5 for leaf nodes)

---

## 📄 Citation
If you're inspired by the original paper, cite:

```bibtex
@inproceedings{ExploreLLM2024,
  title={Beyond Chatbots: ExploreLLM for Structured Thoughts and Personalized Model Responses},
  author={Anonymous},
  booktitle={NeurIPS},
  year={2024}
}
```

---

## 🙌 Acknowledgements
This project is a community re-implementation for educational and prototyping purposes. It aims to validate the design principles of schema-based interaction patterns for LLMs proposed in ExploreLLM.

Feel free to fork, extend, and experiment with your own custom decompositions and workflows!
