"""Compatibility launcher for the maintained Flask API in ``src/app.py``."""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from backend.app import app  # noqa: E402


if __name__ == "__main__":
    app.run(port=5001)
