console.log("Steam Meter loaded!");

function detectGamePage() {
  const url = window.location.href;

  // Does URL contain /app/ (game page)?
  if (url.includes("/app/")) {
    console.log("Game page detected!");

    // Extract game id from URL
    const match = url.match(/\/app\/(\d+)/);
    if (match) {
      const gameID = match[1];
      console.log("Sending game ID to background:", gameID);

      chrome.runtime.sendMessage({ action: "analyzeReviews", gameID: gameID }, (response) => {
        console.log("Background responded:", response);
      });
    }
  }
}

// Run when page loads
detectGamePage();
