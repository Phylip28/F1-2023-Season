from fastapi import APIRouter
from app.schemas.session import SessionSchema
from app.services import f1_service

router = APIRouter(prefix="/season")

@router.get("/summary", response_model=list[SessionSchema])
def get_season_summary():

    raw_data = f1_service.get_2023_season_data()

    return raw_data