import random

from nltk.corpus import movie_reviews
from nltk.sentiment import SentimentIntensityAnalyzer


def random_review_sample(size: int) -> list[str]:
    reviews = []
    fileids = movie_reviews.fileids()
    for _ in range(size):
        random_fileid = random.choice(fileids)
        reviews.append(movie_reviews.raw(random_fileid))

    return reviews


def get_positive_review() -> str:
    pos_field = random.choice(movie_reviews.fileids("pos"))
    pos_text = movie_reviews.raw(pos_field)
    return pos_text


def get_negative_review() -> str:
    neg_field = random.choice(movie_reviews.fileids("neg"))
    neg_text = movie_reviews.raw(neg_field)
    return neg_text


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

    return {
        "total_reviews": total,
        "average_score": round(avg_score, 3),
        "overall_sentiment": overall,
        "positive_count": positive_count,
        "negative_count": negative_count,
        "neutral_count": neutral_count,
        "positive_percent": round((positive_count / total) * 100, 1),
        "negative_percent": round((negative_count / total) * 100, 1),
        "neutral_percent": round((neutral_count / total) * 100, 1),
        "highest_score": round(max_score, 3),
        "lowest_score": round(min_score, 3),
    }
