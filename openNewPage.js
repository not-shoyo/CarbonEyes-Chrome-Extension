window.onload = () => {
  document.getElementById("link").addEventListener("click", function (event) {
    event.preventDefault();

    console.log("clicked");

    //linking to externally hosted website
    // window.open("https://www.nitk.ac.in/", "_blank");

    // linking to local file
    window.open("index.html", "_blank"); 
  });
};
