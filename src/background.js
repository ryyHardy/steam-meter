console.log("Background script loaded!");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  if (request.action === "analyzeReviews") {
    console.log("Analyzing reviews for game:", request.gameID);

    sendResponse({ success: true });
  }

  return true;
});
