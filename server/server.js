const {networkInterfaces} = require("os");
const express = require("express");
const {Server} = require("socket.io");
const {createServer} = require("http");

const path = require("path");

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 80;

app.use(express.static(path.resolve(__dirname, "../public")));

// IO = esta es la comunicacion del backend
module.exports.io = new Server(httpServer, {
  /* options */
  allowEIO3: true, // false by default
});
require("./sockets/socket");

httpServer.listen(port, (err) => {
  if (err) throw new Error(err);

  let ipServer = Object.values(networkInterfaces())
    .flat()
    .filter(({family, internal}) => family === "IPv4" && !internal)
    .map(({address}) => address);

  console.log(`Servidor en ${ipServer}:${port}`);
});
