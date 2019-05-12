const http = require("http");

http
  .createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("It's working");
  })
  .listen(4000);
