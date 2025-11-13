from flask import Flask, jsonify, request
from flask_cors import CORS
from pydantic import ValidationError

# Ensure that __init__.py runs for nlp package
import nlp
from api import ReviewResponse
from nlp.sentiment import SentimentReport, sentiment_report

app = Flask(__name__)
CORS(app)


@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Handle both list of review texts and list of ReviewResponse objects
        if isinstance(data, list):
            if len(data) == 0:
                return jsonify({"error": "Empty review list provided"}), 400

            # Check if the first item is a string (just review texts) or dict (full ReviewResponse)
            if isinstance(data[0], str):
                reviews_as_text = data
            else:
                reviews = [ReviewResponse(**item) for item in data]
                reviews_as_text = [review.review for review in reviews]
        elif isinstance(data, dict) and "reviews" in data:
            # Handle {"reviews", [...]} format
            reviews_data = data["reviews"]
            if len(reviews_data) == 0:
                return jsonify({"error": "Empty review list provided"}), 400

            if isinstance(reviews_data[0], str):
                reviews_as_text = reviews_data
            else:
                reviews = [ReviewResponse(**item) for item in reviews_data]
                reviews_as_text = [review.review for review in reviews]
        else:
            return jsonify(
                {
                    "error": "Invalid request format. Expected list of reviews or {'reviews': [...]}"
                }
            ), 400

        report = sentiment_report(reviews_as_text)

        return jsonify(report.model_dump()), 200

    except ValidationError as e:
        return jsonify({"error": "Validation error", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for deployment monitoring"""
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"

    app.run(debug=debug, host="0.0.0.0", port=port)
