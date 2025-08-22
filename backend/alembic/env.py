# alembic/env.py
from logging.config import fileConfig
import os
import sys
import re

from alembic import context
from sqlalchemy import create_engine, pool

# Racine du projet = dossier parent de alembic/
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT_DIR)

from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402
from app.models import prospect, campaign, agent, user  # noqa: F401,E402

# Alembic config
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Métadonnées pour l'autogénération
target_metadata = Base.metadata


def _make_sync_url(url: str) -> str:
    """
    Convertit une URL async -> sync et garantit un chemin SQLite absolu.
    Évite le piège 'sqlite:////./data...' qui crée un chemin /./data.
    """
    # Normaliser le driver tout en conservant EXACTEMENT 'sqlite:///'
    url = re.sub(r"^sqlite\+aiosqlite:///*", "sqlite:///", url)
    url = re.sub(r"^postgresql\+asyncpg://", "postgresql://", url)

    # Relatif -> Absolu pour SQLite
    if url.startswith("sqlite:///"):
        path = url[len("sqlite:///"):]  # ex: "./data/prospecting.db" ou "data/prospecting.db"
        if not os.path.isabs(path):
            path = os.path.abspath(os.path.join(ROOT_DIR, path))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        url = f"sqlite:///{path}"
    return url


def run_migrations_offline() -> None:
    """Exécute les migrations en mode 'offline'."""
    url = _make_sync_url(settings.DATABASE_URL)
    print(f"[alembic] offline URL = {url}")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Exécute les migrations en mode 'online'."""
    url = _make_sync_url(settings.DATABASE_URL)
    print(f"[alembic] online  URL = {url}")
    engine = create_engine(url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
