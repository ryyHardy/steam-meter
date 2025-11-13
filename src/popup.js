// Popup script - handles the extension popup UI

let currentGameId = null;

// Check if we're on a Steam game page when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const currentTab = tabs[0];

  if (currentTab && currentTab.url) {
    const url = currentTab.url;
    const match = url.match(/\/app\/(\d+)/);

    if (match) {
      currentGameId = match[1];
      document.getElementById("gameId").textContent = currentGameId;
      document.getElementById("gameInfo").style.display = "block";
      document.getElementById("analyzeBtn").disabled = false;
      document.getElementById("status").textContent =
        "Ready to analyze reviews!";
      document.getElementById("status").className = "status waiting";

      // Try to get game name (from practice exercise hint!)
      fetchGameName(currentGameId);
    } else {
      document.getElementById("status").textContent =
        "Not on a Steam game page";
      document.getElementById("status").className = "status error";
    }
  }
});

// Fetch game name from Steam API
async function fetchGameName(gameId) {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${gameId}`
    );
    const data = await response.json();

    if (data[gameId] && data[gameId].success) {
      const gameName = data[gameId].data.name;
      document.getElementById("gameName").textContent = gameName;
    }
  } catch (error) {
    console.error("Error fetching game name:", error);
    document.getElementById("gameName").textContent = "Unknown Game";
  }
}

// Handle analyze button click
document.getElementById("analyzeBtn").addEventListener("click", () => {
  if (!currentGameId) return;

  // Update UI to analyzing state
  document.getElementById("analyzeBtn").disabled = true;
  document.getElementById("status").innerHTML =
    '<div class="loading"></div> Fetching reviews...';
  document.getElementById("status").className = "status analyzing";

  // Send message to content script to fetch reviews
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "analyzeReviews", gameId: currentGameId },
      response => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
          showError("Failed to communicate with page");
        }
      }
    );
  });
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Popup received message:", request);

  if (request.action === "reviewsAnalyzed") {
    displayResults(request.data);
  } else if (request.action === "analysisFailed") {
    showError(request.error);
  }

  return true;
});

function displayResults(data) {
  document.getElementById("status").textContent = "✓ Analysis Complete!";
  document.getElementById("status").className = "status complete";
  document.getElementById("analyzeBtn").disabled = false;

  // Update basic stats (from Steam API)
  document.getElementById("totalReviews").textContent =
    data.summary?.total_reviews || "-";
  document.getElementById("fetchedReviews").textContent = data.reviews.length;
  document.getElementById("positiveCount").textContent =
    data.summary?.total_positive || "-";
  document.getElementById("negativeCount").textContent =
    data.summary?.total_negative || "-";

  // Display sentiment analysis results from backend
  if (data.sentimentReport) {
    const report = data.sentimentReport;

    // Update sentiment stats
    const sentimentEl = document.getElementById("sentimentOverall");
    const avgScoreEl = document.getElementById("avgScore");
    const positivePercentEl = document.getElementById("positivePercent");
    const negativePercentEl = document.getElementById("negativePercent");
    const neutralPercentEl = document.getElementById("neutralPercent");

    if (sentimentEl) sentimentEl.textContent = report.overall_sentiment;
    if (avgScoreEl) avgScoreEl.textContent = report.avg_score.toFixed(3);
    if (positivePercentEl)
      positivePercentEl.textContent = `${report.positive_percent}%`;
    if (negativePercentEl)
      negativePercentEl.textContent = `${report.negative_percent}%`;
    if (neutralPercentEl)
      neutralPercentEl.textContent = `${report.neutral_percent}%`;
  }

  // Show results
  document.getElementById("results").className = "results visible";
}

// Show error message
function showError(errorMsg) {
  document.getElementById("status").textContent = "✗ " + errorMsg;
  document.getElementById("status").className = "status error";
  document.getElementById("analyzeBtn").disabled = false;
}
