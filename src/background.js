// Background script - handles extension events
console.log("Background script loaded");

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.action === "reviewsFetched") {
    console.log("Processing reviews for game:", request.gameId);
    console.log("Number of reviews:", request.reviews.length);
    console.log("Summary:", request.summary);

    // Extract just the review texts
    const reviewTexts = request.reviews.map(review => review.review);
    console.log("Review texts extracted:", reviewTexts.length);

    // Log first few reviews as examples
    console.log("Sample reviews:");
    reviewTexts.slice(0, 3).forEach((text, index) => {
      console.log(`Review ${index + 1}:`, text.substring(0, 100) + "...");
    });

    // Send results to popup if it's open
    chrome.runtime
      .sendMessage({
        action: "reviewsAnalyzed",
        data: {
          reviews: request.reviews,
          summary: request.summary,
        },
      })
      .catch(err => {
        // Popup might not be open, that's okay
        console.log("Popup not open");
      });

    sendResponse({ success: true });
  }

  return true;
});
