from fastapi import FastAPI
from api.decompose import router as decompose_router
from api.options import router as options_router
from api.summary import router as summary_router
import dotenv; dotenv.load_dotenv()

app = FastAPI()
app.include_router(decompose_router)
app.include_router(options_router)
app.include_router(summary_router)

@app.get("/")
async def root():
    return {"status": "ok"}