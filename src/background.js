// Background script - handles extension events
console.log("Background script loaded");

const BACKEND_URL = "https://steam-meter-backend.onrender.com";

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.action === "reviewsFetched") {
    console.log("Processing reviews for game:", request.gameId);
    console.log("Number of reviews:", request.reviews.length);

    // Send reviews to backend API for sentiment analysis
    analyzeReviewsWithBackend(request.reviews, request.gameId)
      .then(sentimentReport => {
        // Send results to popup
        chrome.runtime
          .sendMessage({
            action: "reviewsAnalyzed",
            data: {
              reviews: request.reviews,
              summary: request.summary,
              sentimentReport: sentimentReport,
            },
          })
          .catch(err => {
            console.log("Popup not open");
          });

        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("Error analyzing reviews:", error);
        chrome.runtime
          .sendMessage({
            action: "analysisFailed",
            error: error.message || "Failed to analyze reviews",
          })
          .catch(err => {
            console.log("Popup not open");
          });

        sendResponse({ success: false, error: error.message });
      });
  }

  return true; // Keep channel open for async response
});

async function analyzeReviewsWithBackend(reviews, gameId) {
  // Extract just the review text strings to avoid validation issues
  // The backend accepts a simple list of strings
  const reviewTexts = reviews
    .map(review => {
      // Handle different possible field names for review text
      return review.review || review.review_text || review.text || "";
    })
    .filter(text => text && text.trim().length > 0); // Filter out empty reviews

  if (reviewTexts.length === 0) {
    throw new Error("No valid review texts found");
  }

  console.log(`Sending ${reviewTexts.length} review texts to backend`);

  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewTexts), // Send as simple array of strings
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const sentimentReport = await response.json();
  console.log("Backend analysis complete:", sentimentReport);
  return sentimentReport;
}
