import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("STEAMMETER_DATA", ROOT / "data"))
# ^ Allows user to customize data path with an environment variable

# Environment configuration
FLASK_ENV = os.environ.get("FLASK_ENV", "production")
PORT = int(os.environ.get("PORT", 5000))
DEBUG = FLASK_ENV == "development"
