"""Orchestrate the full ETL pipeline for configured years."""

import argparse

from etl.config import config
from etl.extract import drivers as extract_drivers
from etl.extract import results as extract_results
from etl.extract import sessions as extract_sessions
from etl.extract import weather as extract_weather
from etl.load import csv_to_postgres
from etl.transform import circuits as transform_circuits
from etl.transform import drivers as transform_drivers
from etl.transform import results as transform_results
from etl.transform import sessions as transform_sessions
from etl.transform import weather as transform_weather


def run_extraction(years: list[int]):
    print("=== EXTRACTION ===")
    for year in years:
        extract_sessions.extract_sessions(year)
    for year in years:
        extract_drivers.extract_drivers(year)
    for year in years:
        extract_results.extract_results(year)
    for year in years:
        extract_weather.extract_weather(year)


def run_transformation(years: list[int]):
    print("=== TRANSFORMATION ===")
    for year in years:
        transform_circuits.transform_circuits(year)
        transform_sessions.transform_sessions(year)
        transform_drivers.transform_drivers(year)
        transform_results.transform_results(year)
        transform_weather.transform_weather(year)


def run_load(years: list[int]):
    print("=== LOAD ===")
    for year in years:
        csv_to_postgres.load_year(year)


def main():
    parser = argparse.ArgumentParser(description="F1 ETL pipeline")
    parser.add_argument(
        "--step",
        choices=["extract", "transform", "load", "all"],
        default="all",
        help="Pipeline step to run",
    )
    parser.add_argument(
        "--year",
        type=int,
        action="append",
        help="Year to process (can be specified multiple times)",
    )
    args = parser.parse_args()

    years = args.year if args.year else config.years

    if args.step in ("extract", "all"):
        run_extraction(years)
    if args.step in ("transform", "all"):
        run_transformation(years)
    if args.step in ("load", "all"):
        run_load(years)


if __name__ == "__main__":
    main()
