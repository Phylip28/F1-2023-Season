from fastapi import FastAPI
from app.routers import season

app = FastAPI()

app.include_router(season.router)

@app.get("/")
def health_check():
    return {"status": "ok"}