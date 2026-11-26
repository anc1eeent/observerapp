"""
Application configuration.
Settings are read from environment variables (or a local .env file)
and validated once at startup, so the application refuses to start
when a required variable is missing instead of failing on a request.
"""
from pydantic import Field, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated application settings."""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(min_length=1)
    # A short or empty key would make tokens easy to forge.
    secret_key: str = Field(min_length=16)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, gt=0)
    environment: str = "development"


def load_settings() -> Settings:
    """Load settings and report every missing or invalid variable by name."""
    try:
        return Settings()
    except ValidationError as error:
        names = sorted({str(item["loc"][0]).upper() for item in error.errors()})
        raise RuntimeError(
            f"Missing or invalid configuration: {', '.join(names)}. "
            "Set these environment variables or add them to .env."
        ) from None


settings = load_settings()
