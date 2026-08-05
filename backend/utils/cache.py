import redis
import json
import os
from typing import Any, Optional
from backend.utils.logger import logger

# Initialize Redis client
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=REDIS_PASSWORD,
        decode_responses=True,
        socket_connect_timeout=2,
    )
    # Test connection
    redis_client.ping()
    logger.info("✅ Redis connected successfully")
except Exception as e:
    logger.warning(f"⚠️ Redis connection failed: {e}. Caching will be disabled.")
    redis_client = None  # Disable caching if Redis fails


class Cache:
    """Redis caching utility"""

    @staticmethod
    def get(key: str) -> Optional[Any]:
        """Get value from cache"""
        if not redis_client:
            return None

        try:
            value = redis_client.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache GET error for key {key}: {e}")
            return None

    @staticmethod
    def set(key: str, value: Any, ttl: int = 300) -> bool:
        """
        Set value in cache
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 5 minutes)
        """
        if not redis_client:
            return False

        try:
            redis_client.setex(
                key,
                ttl,
                json.dumps(value, default=str)
            )
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache SET error for key {key}: {e}")
            return False

    @staticmethod
    def delete(key: str) -> bool:
        """Delete key from cache"""
        if not redis_client:
            return False

        try:
            redis_client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache DELETE error for key {key}: {e}")
            return False

    @staticmethod
    def delete_pattern(pattern: str) -> bool:
        """Delete all keys matching pattern"""
        if not redis_client:
            return False

        try:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
                logger.debug(f"Cache DELETE PATTERN: {pattern} ({len(keys)} keys)")
            return True
        except Exception as e:
            logger.error(f"Cache DELETE PATTERN error for {pattern}: {e}")
            return False

    @staticmethod
    def clear_user_cache(user_id: str) -> bool:
        """Clear all cache for a specific user"""
        return Cache.delete_pattern(f"user:{user_id}:*")


def get_cache_key(user_id: str, resource: str, *args) -> str:
    """Generate a consistent cache key"""
    parts = [f"user:{user_id}", resource] + [str(arg) for arg in args]
    return ":".join(parts)