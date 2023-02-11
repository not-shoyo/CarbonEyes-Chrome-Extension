chrome.tabs.onCreated.addListener((tab)=> {
    console.log(tab.id)
})