from fastapi import APIRouter
from app.schemas.session import (
    DriverClassificationSchema,
    SessionFilterSchema,
    SessionSchema,
    WeatherSchema,
)
from app.services import f1_service

router = APIRouter(prefix="/season")


@router.get("/summary/{circuit_key}", response_model=list[SessionSchema])
def get_circuit_data(circuit_key: int):

    raw_data = f1_service.get_circuit_data(circuit_key)

    return raw_data


@router.post("/ft_session", response_model=list[SessionSchema])
def get_filtered_session(filter_params: SessionFilterSchema):

    filtered_data = f1_service.filter_sessions_by_type(
        filter_params.circuit_key, filter_params.session_type
    )

    return filtered_data


@router.post("/classification", response_model=list[DriverClassificationSchema])
def get_driver_classification(filter_params: SessionFilterSchema):

    classification_data = f1_service.get_driver_classification(
        filter_params.circuit_key, filter_params.session_type
    )

    return classification_data


@router.get("/weather/{circuit_key}", response_model=list[WeatherSchema])
def get_race_weather(circuit_key: int):

    weather_data = f1_service.get_race_weather(circuit_key)

    return weather_data
