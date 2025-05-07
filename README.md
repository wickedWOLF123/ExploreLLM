# ExploreLLM

A two-layer task decomposition UI that helps break down complex tasks into manageable sub-tasks using LLM capabilities.

## Features

- Break down complex tasks into 3-8 sub-problems
- Get personalized recommendations and options for each sub-task
- Generate summaries based on selected options
- Store user preferences and selections in localStorage
- Modern UI with responsive design

## Tech Stack

### Frontend
- Next.js 13
- React 18
- Tailwind CSS
- TypeScript

### Backend
- FastAPI
- OpenAI GPT-4
- Python 3.8+

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/explorellm.git
cd explorellm
```

2. Set up the frontend:
```bash
# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

3. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## API Endpoints

- `POST /api/decompose`: Break down a main goal into sub-problems
- `POST /api/options`: Get recommendations and options for a sub-task
- `POST /api/summary`: Generate a personalized summary

## Development

- Frontend hot-reload is enabled by default with `next dev`
- Backend hot-reload is enabled with `uvicorn --reload`
- API routes are proxied from `/api` to `localhost:8000`

## License

MIT
