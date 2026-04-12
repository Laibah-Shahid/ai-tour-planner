"""
Disaster monitoring service — adapted from the news repo scripts.
Checks for disaster-related news that conflicts with travel itineraries.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import feedparser
import requests
from langchain_openai import ChatOpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Regional Map (from regional_map.py)
# ---------------------------------------------------------------------------

REGION_MAP = {
    "Hunza": "Gilgit",
    "Besham": "Gilgit",
    "Karakoram Highway": "Gilgit",
    "Shigar": "Skardu",
    "Basho Valley": "Skardu",
    "Rawalpindi": "Islamabad",
    "Margalla Hills": "Islamabad",
    "Naran": "Mansehra",
    "Kaghan": "Mansehra",
    "Fairy Meadows": "Gilgit",
    "Naltar Valley": "Gilgit",
    "Deosai": "Skardu",
    "Attabad Lake": "Gilgit",
    "Passu": "Gilgit",
    "Khunjerab": "Gilgit",
}


def map_to_city(location: str) -> str:
    return REGION_MAP.get(location, location)


# ---------------------------------------------------------------------------
# Keyword Filter (from kw_filter.py)
# ---------------------------------------------------------------------------

DISASTER_KEYWORDS = [
    "flood", "rain", "landslide", "earthquake",
    "road blocked", "traffic suspended",
    "storm", "snowfall", "avalanche",
    "cyclone", "heatwave", "drought",
    "road closure", "highway blocked",
]


def filter_disaster_news(articles: list[dict]) -> list[dict]:
    filtered = []
    for article in articles:
        text = (article.get("title", "") + " " + article.get("description", "")).lower()
        if any(kw in text for kw in DISASTER_KEYWORDS):
            filtered.append(article)
    return filtered


# ---------------------------------------------------------------------------
# News Fetcher (from news_fetcher.py)
# ---------------------------------------------------------------------------

THENEWS_API = "https://api.thenewsapi.com/v1/news/all"
WORLD_NEWS_API = "https://api.worldnewsapi.com/search-news"

RSS_URLS = [
    "https://tribune.com.pk/feed/home",
    "https://www.thenews.com.pk/rss/1/1",
    "https://www.express.pk/rss/",
]


def fetch_news(city: str) -> list[dict]:
    settings = get_settings()
    articles: list[dict] = []

    # TheNewsAPI
    if settings.THENEWS_API_KEY:
        try:
            params = {"api_token": settings.THENEWS_API_KEY, "search": city, "language": "en"}
            res = requests.get(THENEWS_API, params=params, timeout=10)
            data = res.json()
            for item in data.get("data", []):
                articles.append({"title": item.get("title", ""), "description": item.get("description", "")})
        except Exception as e:
            logger.warning("TheNewsAPI error for '%s': %s", city, e)

    # WorldNewsAPI
    if settings.WORLD_NEWS_API_KEY:
        try:
            params = {"q": city, "api_token": settings.WORLD_NEWS_API_KEY}
            res = requests.get(WORLD_NEWS_API, params=params, timeout=10)
            data = res.json()
            for item in data.get("articles", []):
                articles.append({"title": item.get("title", ""), "description": item.get("description", "")})
        except Exception as e:
            logger.warning("WorldNewsAPI error for '%s': %s", city, e)

    # RSS feeds
    for url in RSS_URLS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries:
                articles.append({"title": entry.get("title", ""), "description": entry.get("summary", "")})
        except Exception as e:
            logger.warning("RSS error for '%s': %s", url, e)

    return articles


# ---------------------------------------------------------------------------
# LLM Extraction (from llm_extraction.py)
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> str | None:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    return match.group(0) if match else None


def extract_event_with_llm(article: dict, llm: ChatOpenAI) -> dict | None:
    prompt = f"""Extract structured disaster info from this news:

ARTICLE:
{article.get('title', '')} {article.get('description', '')}

Return ONLY valid JSON:
{{
  "event_type": "",
  "location": "",
  "date": "",
  "impact": "",
  "severity": ""
}}"""
    try:
        response = llm.invoke(prompt)
        raw = response.content
        clean_json = _extract_json(raw)
        if clean_json:
            return json.loads(clean_json)
        return None
    except Exception as e:
        logger.warning("LLM extraction failed: %s", e)
        return None


# ---------------------------------------------------------------------------
# Conflict Checker (from conflict_chekker.py)
# ---------------------------------------------------------------------------

def check_conflict(events: list[dict], itinerary_item: dict) -> list[dict]:
    alerts = []
    city = itinerary_item.get("city", "")
    date = itinerary_item.get("date", "")

    for event in events:
        mapped_city = map_to_city(event.get("location", ""))
        if mapped_city.lower() == city.lower() and event.get("date") == date:
            alerts.append({
                "city": city,
                "date": date,
                "event": event.get("event_type", "unknown"),
                "impact": event.get("impact", ""),
                "severity": event.get("severity", "medium"),
            })
    return alerts


# ---------------------------------------------------------------------------
# Main disaster check pipeline
# ---------------------------------------------------------------------------

def _get_llm() -> ChatOpenAI:
    settings = get_settings()
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        base_url=settings.LLM_BASE_URL,
        temperature=settings.LLM_TEMPERATURE,
        api_key=settings.OPENAI_API_KEY,
    )


def check_itinerary_for_disasters(
    cities: list[str],
    dates: list[str],
) -> list[dict]:
    """
    Check if any city+date combinations have disaster-related news.

    Args:
        cities: List of city names to check
        dates: List of dates (YYYY-MM-DD) corresponding to cities

    Returns:
        List of alert dicts with city, date, event, impact, severity
    """
    llm = _get_llm()
    all_alerts: list[dict] = []

    # Build itinerary items from cities and dates
    items = []
    for i, city in enumerate(cities):
        date = dates[i] if i < len(dates) else ""
        items.append({"city": city, "date": date})

    seen_cities: set[str] = set()

    for item in items:
        city = item["city"]

        # Avoid fetching news for the same city twice
        if city.lower() in seen_cities:
            continue
        seen_cities.add(city.lower())

        try:
            # 1. Fetch news
            articles = fetch_news(city)

            # 2. Filter disaster news
            disaster_articles = filter_disaster_news(articles)

            # 3. Extract structured events via LLM
            events = []
            for article in disaster_articles[:10]:  # Limit to prevent excessive LLM calls
                event = extract_event_with_llm(article, llm)
                if event:
                    events.append(event)

            # 4. Check conflicts for all items with this city
            for it in items:
                if it["city"].lower() == city.lower():
                    alerts = check_conflict(events, it)
                    all_alerts.extend(alerts)

        except Exception as e:
            logger.error("Disaster check failed for '%s': %s", city, e)

    return all_alerts


def check_general_alerts(cities: list[str]) -> list[dict]:
    """
    Check for general disaster alerts for given cities (without date matching).
    Returns all disaster-related events found for the cities.
    """
    llm = _get_llm()
    all_events: list[dict] = []

    for city in set(cities):
        try:
            articles = fetch_news(city)
            disaster_articles = filter_disaster_news(articles)

            for article in disaster_articles[:10]:
                event = extract_event_with_llm(article, llm)
                if event:
                    event["checked_city"] = city
                    all_events.append(event)
        except Exception as e:
            logger.error("General alert check failed for '%s': %s", city, e)

    return all_events
