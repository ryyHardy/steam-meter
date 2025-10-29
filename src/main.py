from nlp.sentiment import random_review_sample, sentiment_report


def main():
    sample = random_review_sample(50)
    report = sentiment_report(sample)

    print("---REPORT---")
    for k, v in report.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
