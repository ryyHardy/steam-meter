// Content script - runs on Steam game pages
console.log("Steam Review Analyzer loaded!");

// Extract game ID from URL
function getGameId() {
  const url = window.location.href;
  const match = url.match(/\/app\/(\d+)/);
  return match ? match[1] : null;
}

// Number of reviews per page returned by the Steam API (capped at 100)
const SAMPLE_SIZE = 80;

// Fetch reviews from Steam API
async function fetchReviews(gameId) {
  console.log("Fetching reviews for game:", gameId);

  // Construct API URL
  const apiUrl = `https://store.steampowered.com/appreviews/${gameId}?json=1&filter=recent&language=english&num_per_page=${SAMPLE_SIZE}&review_type=all`;

  try {
    // Make API request
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check if successful
    if (data.success === 1) {
      const reviewCount = data.reviews.length;
      const totalPositive = data.query_summary.total_positive;
      const totalNegative = data.query_summary.total_negative;

      console.log("Reviews fetched successfully!");
      console.log("Number of reviews:", reviewCount);
      console.log("Total positive reviews:", totalPositive);
      console.log("Total negative reviews:", totalNegative);
      console.log("Review data:", data.reviews);

      // Send data to background script for processing
      chrome.runtime.sendMessage({
        action: "reviewsFetched",
        gameId: gameId,
        reviews: data.reviews,
        summary: data.query_summary,
      });
    } else {
      console.error("Failed to fetch reviews");
      // Send error to background script
      chrome.runtime.sendMessage({
        action: "analysisFailed",
        error: "Failed to fetch reviews from Steam API",
      });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Send error to background script
    chrome.runtime.sendMessage({
      action: "analysisFailed",
      error: "Error fetching reviews: " + error.message,
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.action === "analyzeReviews") {
    fetchReviews(request.gameId);
    sendResponse({ success: true });
  }

  return true;
});

// Display success message on page
function showSuccessMessage(count) {
  const message = document.createElement("div");
  message.textContent = `Successfully fetched ${count} reviews!`;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 20px;
    background-color: #4CAF50;
    color: white;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  `;

  document.body.appendChild(message);

  // Remove after 5 seconds
  setTimeout(() => {
    message.remove();
  }, 5000);
}

// Display error message on page
function showErrorMessage(errorText) {
  const message = document.createElement("div");
  message.textContent = errorText;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    padding: 20px;
    background-color: #f44336;
    color: white;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  `;

  document.body.appendChild(message);

  // Remove after 5 seconds
  setTimeout(() => {
    message.remove();
  }, 5000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.action === "analyzeReviews") {
    fetchReviews(request.gameId);
    sendResponse({ success: true });
  }

  return true;
});
