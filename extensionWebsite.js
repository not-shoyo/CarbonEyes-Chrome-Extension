let tableData = new Map();
let existingDomains = new Set();
let existingTabs = new Set();

var totalDataMatrix = [];
var totalData = 0;

let domainToCollapsable = new Map();
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

document.getElementById("clearHistory").addEventListener("click", clearData);

async function clearData() {
  existingDomains = new Set();
  tableData = new Map();
  tobeSetTo = { data: [] };
  chrome.storage.local.set(
    tobeSetTo,
    chrome.storage.local.get("data", (message) => console.log(message))
  );
}

function refreshData() {
  chrome.storage.local.get("data", (message) => {
    existingDomains = new Set();
    tableData = new Map();

    if (JSON.stringify(message) === JSON.stringify({})) return;

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
      tableBody.firstChild.remove();
    }
    var finalData = new Map();

    tableData.forEach(({ idx, tabsMapping }, domain) => {
      //compute total data transfer size
      let allSize = 0;
      tabsMapping.forEach((val, key) => {
        allSize += val.size;
      });

      finalData.set(domain, {
        domain: domain,
        size: allSize,
        emmision: findEmission(allSize),
        numberOfTabs: tabsMapping.size,
      });
    });

    //console.log(tableBody, finalData, message.data)

    finalData = [...finalData.values()];

    if (document.getElementById("flexCheckDefault").checked) {
      finalData.sort(function (a, b) {
        return a.emmission - b.emmission;
      });

      finalData = finalData.slice().sort((a, b) => b.emmision - a.emmision);
    }

    rowIndex = 1;
    finalData.forEach((domainToData) => {
      const tableRow = document.createElement("div");
      const rowBtn = document.createElement("button");
      const rowNum = document.createElement("span");
      const rowDomainName = document.createElement("span");
      const rowSize = document.createElement("span");
      const rowEmission = document.createElement("span");
      const rowClassification = document.createElement("span");

      tableRow.className = "custom-row";
      rowBtn.className = "custom-accordion-button button-expand";
      rowBtn.value = domainToData.domain;
      rowBtn.innerText = "Expand";

      const rowPanel = document.createElement("div");
      rowPanel.style.display = domainToCollapsable.get(domainToData.domain) ? domainToCollapsable.get(domainToData.domain) : "none";
      domainToCollapsable.set(domainToData.domain, rowPanel.style.display);
      rowPanel.className = "custom-toggle-able-panel";
      rowPanel.id = domainToData.domain;

      let totalSize = 0;
      let totalEmission = 0;

      console.log(domainToData.domain);
      console.log(tableData);
      console.log(tableData[domainToData.domain]);

      tableData.get(domainToData.domain).tabsMapping.forEach((record, tab) => {
        existingTabs.add(tab);
        totalSize += record.size;
        totalEmission += record.cumulativeEmission;

        const subRow = document.createElement("div");
        const subRowUrl = document.createElement("span");
        const subRowSize = document.createElement("span");
        const subRowEmission = document.createElement("span");

        subRow.className = "custom-row";
        subRowUrl.className = "sub-row-url";
        subRowSize.className = "sub-row-size";

        subRowUrl.innerText = record.url;
        subRowSize.innerText = record.size;
        subRowEmission.innerText = findEmission(record.size);

        subRow.appendChild(document.createElement("span"));
        subRow.appendChild(document.createElement("span"));
        subRow.appendChild(subRowUrl);
        subRow.appendChild(subRowSize);
        subRow.appendChild(subRowEmission);
        subRow.appendChild(document.createElement("span"));

        rowPanel.appendChild(subRow);
      });

      rowBtn.onclick = (e) => {
        var panel = rowPanel;
        if (panel.style.display === "flex") {
          panel.style.display = "none";
          domainToCollapsable.set(domainToData.domain, panel.style.display);
        } else {
          panel.style.display = "flex";
          domainToCollapsable.set(domainToData.domain, panel.style.display);
        }
      };

      rowNum.innerText = rowIndex++;
      rowDomainName.innerText = domainToData.domain;
      rowSize.innerText = domainToData.size;
      rowEmission.innerText = domainToData.emmision;
      const emiPerTab = domainToData.emmision / domainToData.numberOfTabs;
      if (emiPerTab > 1) {
        rowClassification.innerHTML = "Non Green";
        rowClassification.style.color = "red";
      } else if (emiPerTab > 0.5) {
        rowClassification.innerText = "Semi Green";
        rowClassification.style.color = "yellow";
      } else {
        rowClassification.innerText = "Green";
        rowClassification.style.color = "green";
      }

      tableRow.onmouseover = () => {
        if (rowClassification.innerText === "Green") {
          tableRow.classList.remove("yellow-ify");
          tableRow.classList.remove("red-ify");
          tableRow.classList.add("green-ify");
          rowPanel.classList.remove("yellow-ify");
          rowPanel.classList.remove("red-ify");
          rowPanel.classList.add("green-ify");
        } else if (rowClassification.innerText === "Semi Green") {
          tableRow.classList.remove("red-ify");
          tableRow.classList.remove("green-ify");
          tableRow.classList.add("yellow-ify");
          rowPanel.classList.remove("red-ify");
          rowPanel.classList.remove("green-ify");
          rowPanel.classList.add("yellow-ify");
        } else {
          tableRow.classList.remove("green-ify");
          tableRow.classList.remove("yellow-ify");
          tableRow.classList.add("red-ify");
          rowPanel.classList.remove("green-ify");
          rowPanel.classList.remove("yellow-ify");
          rowPanel.classList.add("red-ify");
        }
      };

      tableRow.appendChild(rowBtn);
      tableRow.appendChild(rowNum);
      tableRow.appendChild(rowDomainName);
      tableRow.appendChild(rowSize);
      tableRow.appendChild(rowEmission);
      tableRow.appendChild(rowClassification);
      tableBody.appendChild(tableRow);
      tableBody.appendChild(rowPanel);
    });

    totalData = 0;
    for (i = 0; i < finalData.length; i++) {
      totalData += finalData[i].emmision;
    }

    if (totalDataMatrix.length < 2) {
      totalDataMatrix.push(totalData);
    } else {
      totalDataMatrix[0] = totalDataMatrix[1];
      totalDataMatrix[1] = totalData;
    }
  });
}
function getData() {
  return Math.random();
}

Plotly.newPlot("chart", [{ y: [getData()], type: "line" }]);

function getTotalEmission() {
  if (totalDataMatrix.length >= 2 || !(totalDataMatrix[1] - totalDataMatrix[0] < 0)) {
    if (totalDataMatrix[1] - totalDataMatrix[0] > 0) return totalDataMatrix[1] - totalDataMatrix[0];
    else return 0;
  } else return 0;
}

function getData() {
  return Math.random();
}

let layout = {
  title: {
    text: "Δ Emission",
    font: {
      family: "Times New Roman",
      size: 24,
    },
  },
  xaxis: {
    title: {
      text: "Time",
      font: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
    },
  },
  yaxis: {
    title: {
      text: "Increase in Emission",
      font: {
        family: "Courier New, monospace",
        size: 18,
        color: "#7f7f7f",
      },
    },
  },
};

Plotly.newPlot("chart", [{ y: [getTotalEmission()], type: "line" }], layout);
var cnt = 0;

setInterval(function () {
  Plotly.extendTraces("chart", { y: [[getTotalEmission()]] }, [0]);
  cnt++;
  if (cnt > 500) {
    Plotly.relayout("chart", {
      xaxis: {
        range: [cnt - 500, cnt],
      },
    });
  }
}, 15);
setInterval(refreshData, 1000);

// chrome.storage.local.get("data", (data)=>{
// console.log(JSON.parse(data))
//})

// var buttons = document.getElementsByClassName("custom-accordion-button");
// var allPanels = document.getElementsByClassName("custom-toggle-able-panel");

// // console.log(buttons);
// // console.log(allPanels);

// var i;

// for (i = 0; i < buttons.length; i++) {
//   buttons[i].addEventListener("click", (e) => {
//     var panel = document.getElementById(e.target.value);

//     // console.log(panel);
//     if (panel.style.display === "flex") {
//       panel.style.display = "none";
//     } else {
//       panel.style.display = "flex";
//     }
//   });
// }
