
let tableData = new Map();
let existingDomains = new Set();
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.message) {
//     const data = JSON.parse(request.message);
//     console.log(data);
//     const { url, size } = data;
//     const domainName = new URL(url).hostname;

//     const idx = tableData.findIndex((td) => {
//       return new RegExp(td.domainName, "g").test(domainName);
//     });
//     console.log(url, size, domainName, idx);

//     const tableBody = document.getElementById("tableBody");

//     if (idx !== -1) {
//       tableData[idx]["dataTransfer"] += size;
//       tableData[idx]["emission"] += findReEmission(findEmission(size));
//       const tableRow = tableBody.children[idx];
//       tableRow.children[3].innerHTML = tableData[idx]["dataTransfer"];
//       tableRow.children[4].innerHTML = tableData[idx]["emission"];
//     } else {
//       tableData.push({ domainName, url, dataTransfer: size, emission: findEmission(size) });
//       const tableRow = document.createElement("tr");
//       const rowNum = document.createElement("td");
//       const rowDomainName = document.createElement("td");
//       const rowUrl = document.createElement("td");
//       const rowSize = document.createElement("td");
//       const rowEmission = document.createElement("td");
//       rowNum.innerText = tableBody.children.length + 1;
//       rowDomainName.innerText = domainName;
//       rowUrl.innerText = url;
//       rowSize.innerText = size;
//       rowEmission.innerText = findEmission(size);

//       tableRow.appendChild(rowNum);
//       tableRow.appendChild(rowDomainName);
//       tableRow.appendChild(rowUrl);
//       tableRow.appendChild(rowSize);
//       tableRow.appendChild(rowEmission);
//       tableBody.appendChild(tableRow);
//     }
//     console.log(tableData);
//   }
//   document.getElementById("dataType").innerHTML = tableData;
// });

findEmission = (data) => {
  return (data * 0.81 * 0.75 * 442) / 1000000000.0;
};

findReEmission = (data) => {
  return data * 0.25 * 2;
};

document.getElementById("clearHistory").addEventListener('click',clearData);

async function clearData()  {
  existingDomains = new Set()
  tableData = new Map();
  tobeSetTo = {data: []}
  chrome.storage.local.set(tobeSetTo, chrome.storage.local.get("data", (message) => console.log(message) ))
}

function refreshData() {
  chrome.storage.local.get("data", (message) => {

    existingDomains = new Set()
    tableData = new Map();

    if(JSON.stringify(message)===JSON.stringify({})) return;

    message["data"].forEach((data) => {

      //console.log(data);
      const { url, size, tab } = data;

      const domainName = new URL(url).hostname;

      if (tableData.has(domainName)) {
        const domain = tableData.get(domainName).tabsMapping;
        if (!domain.has(tab)) {
          domain.set(tab, { size, emission: findReEmission(size), cumulativeEmission: findReEmission(size), url });
        } else {
          const oldEmission = domain.get(tab)["emission"];
          const oldCumulativeEmission = domain.get(tab)["cumulativeEmission"];
          domain.set(tab, {
            size,
            emission: findReEmission(size),
            cumulativeEmission: oldCumulativeEmission + findReEmission(size) - oldEmission,
            url,
          });
        }
      } else {
        tableData.set(domainName, { idx: tableData.size, tabsMapping: new Map() });
        var domain = tableData.get(domainName).tabsMapping;
        domain.set(tab, { size, emission: findEmission(size), cumulativeEmission: findEmission(size), url });
      }
    });

    var tableBody = document.getElementById("tableBody");

    //remove add tablebody
    while (tableBody.firstChild) {
      tableBody.firstChild.remove()
    }
    var finalData = new Map()

    tableData.forEach(({ idx, tabsMapping }, domain) => {
      //compute total data transfer size
      let allSize =0 ;
      tabsMapping.forEach((val, key)=>{allSize += val.size})

      finalData.set(domain,  {
        domain: domain,
        size : allSize,
        emmision: findEmission(allSize),
        numberOfTabs: tabsMapping.size
      })
    })

    //console.log(tableBody, finalData, message.data)

    finalData = [...finalData.values()]

    if(document.getElementById("flexCheckDefault").checked) {
      finalData.sort(function (a, b) {
        return a.emmission - b.emmission;
      });
  
      finalData = finalData.slice().sort((a, b) => b.emmision - a.emmision);
    }

    rowIndex = 1
    finalData.forEach((domainToData) => {
        const tableRow = document.createElement("tr");
        const rowNum = document.createElement("td");
        const rowDomainName = document.createElement("td");
        const rowSize = document.createElement("td");
        const rowEmission = document.createElement("td");
        const rowClassification = document.createElement("td");
        
        rowNum.innerText = rowIndex
        rowIndex++;
        rowDomainName.innerText = domainToData.domain
        rowSize.innerText = domainToData.size
        rowEmission.innerText = domainToData.emmision
        const emiPerTab  = domainToData.emmision/domainToData.numberOfTabs
        if(emiPerTab>1 ){
          rowClassification.innerHTML = "Non Green"
          rowClassification.style.color = "red"
        }
        else if(emiPerTab >0.5){
          rowClassification.innerText = "Semi green"
          rowClassification.style.color = "blue"
        }
        else{
          rowClassification.innerText = "Green"
          rowClassification.style.color = "green"
        }

        tableRow.appendChild(rowNum);
        tableRow.appendChild(rowDomainName);
        tableRow.appendChild(rowSize);
        tableRow.appendChild(rowEmission);
        tableRow.appendChild(rowClassification);
        tableBody.appendChild(tableRow);
    })

    // tableData.forEach(({ idx, tabsMapping }, domain) => {
    //   if (!existingDomains.has(domain)) {
    //     existingDomains.add(domain);

    //     const tableRow = document.createElement("tr");
    //     const rowNum = document.createElement("td");
    //     const rowDomainName = document.createElement("td");
    //     const rowSize = document.createElement("td");
    //     const rowEmission = document.createElement("td");

    //     let totalSize = 0;
    //     let totalEmission = 0;

    //     tabsMapping.forEach((record, tabs) => {
    //       totalSize += record.size;
    //       totalEmission += record.cumulativeEmission;
    //     });

    //     rowNum.innerText = idx + 1;
    //     rowDomainName.innerText = domain;
    //     rowSize.innerText = totalSize;
    //     // rowEmission.innerText = totalEmission;
    //     rowEmission.innerText = findEmission(totalSize);

    //     tableRow.appendChild(rowNum);
    //     tableRow.appendChild(rowDomainName);
    //     tableRow.appendChild(rowSize);
    //     tableRow.appendChild(rowEmission);
    //     tableBody.appendChild(tableRow);
    //   } else {
    //       const tableRow = tableBody.children[idx];
    //       if( tableRow ){
    //         let totalSize = 0;
    //         let totalEmission = 0;
    //         tabsMapping.forEach((record, tabs) => {
    //           totalSize += record.size;
    //           totalEmission += record.cumulativeEmission;
    //         });
    //         tableRow.children[2].innerText = totalSize;
    //         tableRow.children[3].innerText = findEmission(totalSize);
    //     }
    //   }
    // });
  });
}

setInterval(refreshData, 1000);

// chrome.storage.local.get("data", (data)=>{
// console.log(JSON.parse(data))
//})
