// Get the active tab
setTimeout(chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // Attach the debugger to the tab
    chrome.debugger.attach({tabId: tabs[0].id}, "1.0", function() {
      // Inject a script into the tab to calculate the total data transferred
      chrome.debugger.sendCommand({tabId: tabs[0].id}, "Runtime.evaluate", {expression: `(function() {
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
      })()`}, function(result) {
        console.log(result.result.value)
        // Update the total-size div with the total amount of data transferred
        document.getElementById("total-size").innerText = "Total data transferred: " + result.result.value + " bytes";
        if(!!!localStorage.getItem("foot-print-co2")){
        }
        else{
        }
      });
    });
  }), 1000);
