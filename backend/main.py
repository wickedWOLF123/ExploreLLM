import os
import dotenv

# Load environment variables before any other imports
dotenv.load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.decompose import router as decompose_router
from api.options import router as options_router
from api.summary import router as summary_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decompose_router)
app.include_router(options_router)
app.include_router(summary_router)

@app.get("/")
async def root():
    return {"status": "ok"}