import {networkInterfaces} from "os";
import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";

import {resolve} from "path";
const __dirname = import.meta.dirname;

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT ?? 80;

app.use(express.static(resolve(__dirname, "../public")));

// IO = esta es la comunicacion del backend
export const io = new Server(httpServer, {
  /* options */
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  // serveClient: false, //dont send "/socket.io/socket.io.js" to front in GET
});
import("./sockets/socket.js");

httpServer.listen(port, (err) => {
  if (err) throw new Error(err);

  let ipServer = Object.values(networkInterfaces())
    .flat()
    .filter(({family, internal}) => family === "IPv4" && !internal)
    .map(({address}) => address);

  console.log(`Servidor en ${ipServer}:${port}`);
});
