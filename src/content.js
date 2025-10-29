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
      console.log("Game ID:", gameID);
    }
  }
}

// Run when page loads
detectGamePage();
