import os

import nltk
from config import DATA_DIR
from nltk.downloader import Downloader

NLTK_DATA_DIR = DATA_DIR / "nltk"

REQUIRED_NLTK_PACKAGES = [
    "movie_reviews",
    "vader_lexicon",
    "punkt",
    "punkt_tab",
    "stopwords",
]


def ensure_nltk_data(
    data_dir: os.PathLike = NLTK_DATA_DIR,
    packages: list[str] = REQUIRED_NLTK_PACKAGES,
):
    """Makes sure a list of required NLTK packages are installed

    :param data_dir: Path to store NLTK data, defaults to NLTK_DATA_DIR
    :type data_dir: str, optional
    :param packages: List of NLTK packages, defaults to REQUIRED_NLTK_PACKAGES
    :type packages: list[str], optional
    """
    os.makedirs(data_dir, exist_ok=True)
    if data_dir not in nltk.data.path:
        nltk.data.path.insert(0, data_dir)

    downloader = Downloader()
    for pkg in packages:
        if not downloader.is_installed(pkg):
            nltk.download(pkg, download_dir=data_dir, quiet=False)


ensure_nltk_data()
