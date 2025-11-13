// Background script - handles extension events
console.log("Background script loaded");

const BACKEND_URL = "https://steam-meter-backend.onrender.com";

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.action === "reviewsFetched") {
    console.log("Processing reviews for game:", request.gameId);
    console.log("Number of reviews:", request.reviews.length);

    // Extract just the review texts (backend accepts list of strings)
    const reviewTexts = request.reviews.map(review => review.review || review).filter(text => text && text.trim().length > 0);
    
    if (reviewTexts.length === 0) {
      const error = new Error("No valid review texts found");
      console.error("Error analyzing reviews:", error);
      chrome.runtime
        .sendMessage({
          action: "analysisFailed",
          error: error.message,
        })
        .catch(err => {
          console.log("Popup not open");
        });
      sendResponse({ success: false, error: error.message });
      return true;
    }

    console.log(`Extracted ${reviewTexts.length} review texts`);

    // Send reviews to backend API for sentiment analysis
    analyzeReviewsWithBackend(reviewTexts, request.gameId)
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

async function analyzeReviewsWithBackend(reviewTexts, gameId) {
  const response = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewTexts),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Backend error response:", errorData); // Log full error for debugging
    const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const sentimentReport = await response.json();
  console.log("Backend analysis complete:", sentimentReport);
  return sentimentReport;
}
