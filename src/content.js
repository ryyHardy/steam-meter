// Content script - runs on Steam game pages
console.log("Steam Review Analyzer loaded!");

// Extract game ID from URL
function getGameId() {
  const url = window.location.href;
  const match = url.match(/\/app\/(\d+)/);
  return match ? match[1] : null;
}

// Create and inject button into page
function createAnalyzeButton() {
  const gameId = getGameId();

  if (!gameId) {
    console.log("Not on a game page");
    return;
  }

  console.log("Game ID detected:", gameId);

  // Create button element
  const button = document.createElement("button");
  button.textContent = "Analyze Reviews";
  button.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10000;
    padding: 15px 25px;
    background-color: #1b2838;
    color: white;
    border: 2px solid #66c0f4;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  `;

  // Add hover effect
  button.onmouseenter = () => {
    button.style.backgroundColor = "#66c0f4";
    button.style.color = "#1b2838";
  };

  button.onmouseleave = () => {
    button.style.backgroundColor = "#1b2838";
    button.style.color = "white";
  };

  // Click handler
  button.onclick = () => {
    console.log("Analyze button clicked!");
    fetchReviews(gameId);
  };

  // Add button to page
  document.body.appendChild(button);
}

// Fetch reviews from Steam API
async function fetchReviews(gameId) {
  console.log("Fetching reviews for game:", gameId);

  // Construct API URL
  const apiUrl = `https://store.steampowered.com/appreviews/${gameId}?json=1&filter=recent&language=english&num_per_page=50&review_type=all`;

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

      // Display success message
      showSuccessMessage(reviewCount);

      // Send data to background script for processing
      chrome.runtime.sendMessage({
        action: "reviewsFetched",
        gameId: gameId,
        reviews: data.reviews,
        summary: data.query_summary,
      });
    } else {
      console.error("Failed to fetch reviews");
      showErrorMessage("Failed to fetch reviews");
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    showErrorMessage("Error fetching reviews: " + error.message);
  }
}

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

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createAnalyzeButton);
} else {
  createAnalyzeButton();
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
