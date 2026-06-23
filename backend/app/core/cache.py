"""Lightweight TTL cache for service-layer responses.

The default implementation stores values in process memory. A Redis-backed
backend can be plugged in later by implementing the same interface.
"""

from __future__ import annotations

import hashlib
import json
import time
from abc import ABC, abstractmethod
from typing import Any

from app.core.config import settings


class CacheBackend(ABC):
    @abstractmethod
    async def get(self, key: str) -> Any | None:
        raise NotImplementedError

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, key: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def clear(self) -> None:
        raise NotImplementedError


class InMemoryTTLCache(CacheBackend):
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float | None]] = {}

    async def get(self, key: str) -> Any | None:
        if key not in self._store:
            return None
        value, expires_at = self._store[key]
        if expires_at is not None and time.monotonic() > expires_at:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        expires_at = time.monotonic() + ttl if ttl is not None else None
        self._store[key] = (value, expires_at)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def clear(self) -> None:
        self._store.clear()


def _build_key(*parts: Any) -> str:
    """Create a deterministic cache key from arbitrary arguments."""
    payload = json.dumps(parts, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class Cache:
    def __init__(self, backend: CacheBackend | None = None) -> None:
        self._backend = backend or InMemoryTTLCache()
        self._enabled = settings.cache_enabled
        self._default_ttl = settings.cache_ttl_seconds

    async def get_or_set(
        self, key_parts: tuple[Any, ...], producer, ttl: int | None = None
    ) -> Any:
        if not self._enabled:
            return await producer()

        key = _build_key(*key_parts)
        cached = await self._backend.get(key)
        if cached is not None:
            return cached

        value = await producer()
        await self._backend.set(key, value, ttl=ttl if ttl is not None else self._default_ttl)
        return value

    async def invalidate(self, *key_parts: Any) -> None:
        await self._backend.delete(_build_key(*key_parts))


cache = Cache()
