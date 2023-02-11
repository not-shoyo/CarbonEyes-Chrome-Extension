let tableData = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message) {
    const data = JSON.parse(request.message);
    console.log(data);
    const { url, size } = data;
    const domainName = new URL(url).hostname;

    const idx = tableData.findIndex((td) => {
      return new RegExp(td.domainName, "g").test(domainName);
    });
    console.log(url, size, domainName, idx);

    const tableBody = document.getElementById("tableBody");

    if (idx !== -1) {
      tableData[idx]["dataTransfer"] += size;
      tableData[idx]["emission"] += findReEmission(findEmission(size));
      const tableRow = tableBody.children[idx];
      tableRow.children[3].innerHTML = tableData[idx]["dataTransfer"];
      tableRow.children[4].innerHTML = tableData[idx]["emission"];
    } else {
      tableData.push({ domainName, url, dataTransfer: size, emission: findEmission(size) });
      const tableRow = document.createElement("tr");
      const rowNum = document.createElement("td");
      const rowDomainName = document.createElement("td");
      const rowUrl = document.createElement("td");
      const rowSize = document.createElement("td");
      const rowEmission = document.createElement("td");
      rowNum.innerText = tableBody.children.length + 1;
      rowDomainName.innerText = domainName;
      rowUrl.innerText = url;
      rowSize.innerText = size;
      rowEmission.innerText = findEmission(size);

      tableRow.appendChild(rowNum);
      tableRow.appendChild(rowDomainName);
      tableRow.appendChild(rowUrl);
      tableRow.appendChild(rowSize);
      tableRow.appendChild(rowEmission);
      tableBody.appendChild(tableRow);
    }
    console.log(tableData);
  }
  document.getElementById("dataType").innerHTML = tableData;
});

findEmission = (data) => {
  return (data * 0.81 * 0.75 * 442) / 1000000000.0;
};

findReEmission = (data) => {
  return data * 2 * 0.25;
};
