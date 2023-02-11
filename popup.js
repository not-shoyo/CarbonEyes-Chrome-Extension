// Get the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // Attach the debugger to the tab
  chrome.debugger.attach({ tabId: tabs[0].id }, "1.0", function () {
    // Inject a script into the tab to calculate the total data transferred
    chrome.debugger.sendCommand(
      { tabId: tabs[0].id },
      "Runtime.evaluate",
      {
        expression: `(function() {
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
      })()`,
      },
      function (result) {
        // Update the total-size div with the total amount of data transferred
        document.getElementById("total-size").innerText = "Total data transferred: " + result.result.value + " bytes";
        console.log(localStorage);
        if (localStorage.length === 0) {
          localStorage.setItem("emissionsData", []);
        }
        let emissionsData = localStorage.getItem("emissionsData");
        let newEmissionsData = [emissionsData, { dataTransfered: result.result.value }];
        localStorage.setItem("emissionsData", newEmissionsData);
        // if (!!!localStorage.getItem("foot-print-co2")) {
        //   localStorage.setItem("");
        // } else {
        //   localStorage.setItem("");
        // }
      }
    );
  }); 
});
