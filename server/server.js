const {networkInterfaces} = require("os");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");

const path = require("path");

const app = express();
let server = http.createServer(app);

const port = process.env.PORT || 80;

app.use(express.static(path.resolve(__dirname, "../public")));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require("./sockets/socket");

server.listen(port, (err) => {
  if (err) throw new Error(err);

  let ipServer = Object.values(networkInterfaces())
    .flat()
    .filter(({family, internal}) => family === "IPv4" && !internal)
    .map(({address}) => address);

  console.log(`Servidor en ${ipServer}:${port}`);
});
