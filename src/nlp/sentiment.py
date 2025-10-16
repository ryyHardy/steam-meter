import random
from dataclasses import dataclass

from nltk.corpus import movie_reviews
from nltk.sentiment import SentimentIntensityAnalyzer


@dataclass
class Sentiment:
    pos: float
    neg: float
    neu: float
    compound: float

    def classify(self) -> str:
        if self.compound >= 0.05:
            return "positive"
        elif self.compound <= -0.05:
            return "negative"
        else:
            return "neutral"


def get_positive_review() -> str:
    pos_field = random.choice(movie_reviews.fileids("pos"))
    pos_text = movie_reviews.raw(pos_field)
    return pos_text


def get_negative_review() -> str:
    neg_field = random.choice(movie_reviews.fileids("neg"))
    neg_text = movie_reviews.raw(neg_field)
    return neg_text


def get_sentiment(text: str) -> Sentiment:
    sia = SentimentIntensityAnalyzer()
    scores = sia.polarity_scores(text)

    return Sentiment(
        pos=scores["pos"],
        neg=scores["neg"],
        neu=scores["neu"],
        compound=scores["compound"],
    )
