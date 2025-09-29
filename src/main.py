import os
import string

import nltk
from nltk.corpus import stopwords
from nltk.downloader import Downloader
from nltk.tokenize import word_tokenize

from config import DATA_DIR

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


def preprocess_text(text: str):
    # Tokenize text
    tokens = word_tokenize(text)

    # Convert to lowercase
    tokens = [token.lower() for token in tokens]

    # Remove punctuation
    tokens = [token for token in tokens if token not in string.punctuation]

    # Remove stop words
    stop_words = set(stopwords.words("english"))
    tokens = [token for token in tokens if token not in stop_words]

    return tokens


def main():
    review_text = "This game is absolutely incredible! The graphics are stunning and the gameplay is super engaging. I highly recommend it to everyone!"
    original_tokens = word_tokenize(review_text)
    processed_tokens = preprocess_text(review_text)

    print("Original text:", review_text)

    print("Original tokens:", original_tokens)

    print("Processed tokens:", processed_tokens)


if __name__ == "__main__":
    ensure_nltk_data()
    main()
