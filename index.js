const express = require("express");
const app = express();

app.get("/", (request, response) => {
    response.send("<h1>Hi there</h1>");
});

app.use("/tt", express.static("./public/TableTop/"))
app.use("/dm", express.static("./public/ControlPanel"))

app.get('/connect', function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    countdown(res, 10)
  })
  
  function countdown(res, count) {
    res.write("data: " + count + "\n\n")
    if (count)
      setTimeout(() => countdown(res, count-1), 1000)
    else
      res.end()
  }

app.listen(3000, () => {
    console.log("Listen on the port 3000...");
});

