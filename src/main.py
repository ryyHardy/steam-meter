from nlp.sentiment import get_negative_review, get_positive_review, get_sentiment


def main():
    pos = get_positive_review()
    neg = get_negative_review()

    pos_sentiment = get_sentiment(pos)
    neg_sentiment = get_sentiment(neg)

    print("\nPOSITIVE REVIEW SENTIMENT:")
    print("Scores:", pos_sentiment)
    print(f"Classification: '{pos_sentiment.classify()}'")

    print("\nNEGATIVE REVIEW SENTIMENT:")
    print("Scores:", neg_sentiment)
    print(f"Classification: '{neg_sentiment.classify()}'")


if __name__ == "__main__":
    main()
