from nltk.sentiment import SentimentIntensityAnalyzer
from pydantic import BaseModel


class SentimentReport(BaseModel):
    review_count: int
    avg_score: float
    overall_sentiment: str
    positive_count: int
    negative_count: int
    neutral_count: int
    positive_percent: float
    negative_percent: float
    neutral_percent: float
    highest_score: float
    lowest_score: float


def sentiment_report(reviews: list[str]):
    sia = SentimentIntensityAnalyzer()

    all_scores = []
    positive_count = negative_count = neutral_count = 0

    for review in reviews:
        compound = sia.polarity_scores(review)["compound"]
        all_scores.append(compound)

        if compound >= 0.05:
            positive_count += 1
        elif compound <= -0.05:
            negative_count += 1
        else:
            neutral_count += 1

    total = len(reviews)
    avg_score = sum(all_scores) / total
    max_score = max(all_scores)
    min_score = min(all_scores)

    # Determine overall sentiment
    if avg_score >= 0.05:
        overall = "positive"
    elif avg_score <= -0.05:
        overall = "negative"
    else:
        overall = "mixed"

    return SentimentReport(
        review_count=total,
        avg_score=round(avg_score, 3),
        overall_sentiment=overall,
        positive_count=positive_count,
        negative_count=negative_count,
        neutral_count=neutral_count,
        positive_percent=round((positive_count / total) * 100, 1),
        negative_percent=round((negative_count / total) * 100, 1),
        neutral_percent=round((neutral_count / total) * 100, 1),
        highest_score=round(max_score, 3),
        lowest_score=round(min_score, 3),
    )
