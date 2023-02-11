

function refreshData() {
chrome.storage.local.get("data", (data)=>{
  if(data) console.log(data);
  document.getElementById("dataType").innerHTML = JSON.stringify(data)
})
}

setInterval(refreshData, 3000)



// chrome.storage.local.get("data", (data)=>{
// console.log(JSON.parse(data))
//})
