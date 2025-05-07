from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import task_router, user_router
from app.core.config import settings

app = FastAPI(
    title="ExploreLLM API",
    description="Backend API for ExploreLLM - A Hybrid UI for Complex Task Exploration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(task_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(user_router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Welcome to ExploreLLM API"} 