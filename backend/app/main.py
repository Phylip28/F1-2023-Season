from fastapi import FastAPI
from app.routers import season
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(season.router)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


@app.get("/")
def health_check():
    return {"status": "ok"}
