



// Listen for messages from the background page
    chrome.runtime.onMessage.addListener(
       function(request, sender, sendResponse) {
        if (request.greeting === "Hello from background page!") {
            console.log("Received message: " + request.greeting);
        }
        });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request.message);
    sendResponse({ message: "Hello from the background script!" });
  });