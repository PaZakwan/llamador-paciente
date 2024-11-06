const {networkInterfaces} = require("os");
const express = require("express");
const {Server} = require("socket.io");
const {createServer} = require("http");

const path = require("path");

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT ?? 80;

app.use(express.static(path.resolve(__dirname, "../public")));

// IO = esta es la comunicacion del backend
module.exports.io = new Server(httpServer, {
  /* options */
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  // serveClient: false, //dont send "/socket.io/socket.io.js" to front in GET
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
