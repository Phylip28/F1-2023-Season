from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.session import (
    DriverClassificationSchema,
    SessionFilterSchema,
    SessionSchema,
    WeatherSchema,
)
from app.services import f1_service

router = APIRouter(prefix="/season")


@router.get("/summary/{circuit_key}", response_model=list[SessionSchema])
async def get_circuit_data(circuit_key: int, db: AsyncSession = Depends(get_db)):
    return await f1_service.get_circuit_data(db, circuit_key)


@router.post("/ft_session", response_model=list[SessionSchema])
async def get_filtered_session(
    filter_params: SessionFilterSchema, db: AsyncSession = Depends(get_db)
):
    return await f1_service.filter_sessions_by_type(
        db, filter_params.circuit_key, filter_params.session_type
    )


@router.post("/classification", response_model=list[DriverClassificationSchema])
async def get_driver_classification(
    filter_params: SessionFilterSchema, db: AsyncSession = Depends(get_db)
):
    return await f1_service.get_driver_classification(
        db, filter_params.circuit_key, filter_params.session_type
    )


@router.get("/weather/{circuit_key}", response_model=list[WeatherSchema])
async def get_race_weather(circuit_key: int, db: AsyncSession = Depends(get_db)):
    return await f1_service.get_race_weather(db, circuit_key)
