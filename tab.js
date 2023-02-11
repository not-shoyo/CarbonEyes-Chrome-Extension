console.log("Script injected into new tab: " + window.location.href);

function sendMessageToBackgroundScript(message) {
    chrome.runtime.sendMessage({ message: message }, function(response) {
      console.log(response.message);
    });
  }

function getDataTransferredTillNow() {
        // Total amount of data transferred
        var totalSize = 0;
  
        // Get the list of network requests
        var networkEntries = performance.getEntriesByType("resource");
  
        // Loop through each network request
        for (var i = 0; i < networkEntries.length; i++) {
          // Increment the total size by the size of the response
          totalSize += networkEntries[i].transferSize;
        }
  
        // Return the total amount of data transferred
        return totalSize;
      }
    
  // Use the sendMessageToBackgroundScript function to send a message to the background script
setInterval(()=>
{
  var size = getDataTransferredTillNow() + "url : "+ window.location.href + ""
  sendMessageToBackgroundScript(size)
}, 3000);