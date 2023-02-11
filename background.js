
// Listen for messages from the background page

chrome.storage.local.get("data", (data)=>{
    if(data) chrome.storage.local.set({"data": []});
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    const addedData  = {
        url: JSON.parse(request.message).url,
        size: JSON.parse(request.message).size,
        tab: sender.tab.id
    }

    chrome.storage.local.get("data", (dataRn)=>{
        //console.log(dataRn.data)
        let data = dataRn.data;
        data.push(addedData)
        chrome.storage.local.set({"data": data});
    })

    const stringData = JSON.stringify(addedData);

    //sendResponse({ message: "Hello from the background script!" });
    chrome.runtime.sendMessage({message: stringData});
  });