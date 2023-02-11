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

function refreshData() {
  chrome.storage.local.get("data", (message) => {
    if (message) console.log(message);

    message["data"].forEach((data) => {
      console.log(data);
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
        const domain = tableData.get(domainName).tabsMapping;
        domain.set(tab, { size, emission: findEmission(size), cumulativeEmission: findEmission(size), url });
      }
    });
    const tableBody = document.getElementById("tableBody");

    console.log(tableData);

    tableData.forEach(({ idx, tabsMapping }, domain) => {
      if (!existingDomains.has(domain)) {
        existingDomains.add(domain);

        const tableRow = document.createElement("tr");
        const rowNum = document.createElement("td");
        const rowDomainName = document.createElement("td");
        const rowSize = document.createElement("td");
        const rowEmission = document.createElement("td");

        let totalSize = 0;
        let totalEmission = 0;

        tabsMapping.forEach((record, tabs) => {
          totalSize += record.size;
          totalEmission += record.cumulativeEmission;
        });

        rowNum.innerText = idx + 1;
        rowDomainName.innerText = domain;
        rowSize.innerText = totalSize;
        // rowEmission.innerText = totalEmission;
        rowEmission.innerText = findEmission(totalSize);

        tableRow.appendChild(rowNum);
        tableRow.appendChild(rowDomainName);
        tableRow.appendChild(rowSize);
        tableRow.appendChild(rowEmission);
        tableBody.appendChild(tableRow);
      } else {
        const tableRow = tableBody.children[idx];

        let totalSize = 0;
        let totalEmission = 0;

        tabsMapping.forEach((record, tabs) => {
          totalSize += record.size;
          totalEmission += record.cumulativeEmission;
        });

        tableRow.children[2].innerText = totalSize;
        // tableRow.children[3].innerText = totalEmission;
        tableRow.children[3].innerText = findEmission(totalSize);
      }
    });
  });
}
function getData() {
  return Math.random();
}  

Plotly.newPlot('chart',[{ y:[getData()],type:'line' }]);

var cnt = 0;

setInterval(function(){

  Plotly.extendTraces('chart',{ y:[[getData()]]}, [0]);
  cnt++;
  if(cnt > 500) {
      Plotly.relayout('chart',{
          xaxis: {
              range: [cnt-500,cnt]
          }
      });
  }
},15);
setInterval(refreshData, 1000);

// chrome.storage.local.get("data", (data)=>{
// console.log(JSON.parse(data))
//})
