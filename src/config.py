import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("STEAMMETER_DATA", ROOT / "data"))
# ^ Allows user to customize data path with an environment variable
