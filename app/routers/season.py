from fastapi import APIRouter
from app.schemas.session import SessionSchema, SessionFilterSchema
from app.services import f1_service

router = APIRouter(prefix="/season")


@router.get("/summary", response_model=list[SessionSchema])
def get_season_summary():

    raw_data = f1_service.get_2023_season_data()

    return raw_data


@router.post("/ft_session", response_model=list[SessionSchema])
def get_filtered_session(filter_params: SessionFilterSchema):

    filtered_data = f1_service.filter_sessions_by_type(
        filter_params.circuit_key, filter_params.session_type
    )

    return filtered_data
