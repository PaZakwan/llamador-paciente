import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";

// ============================
// Variable global para la ruta donde corre el server
// ============================
import {resolve} from "path";
process.env.MAIN_FOLDER = resolve(import.meta.dirname);

await import("#MAIN_FOLDER/config.js");

const app = express();
const httpServer = createServer(app);

app.use(express.static(resolve(process.env.MAIN_FOLDER, "../public")));

// IO = esta es la comunicacion del backend
export const io = new Server(httpServer, {
  /* options */
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  // serveClient: false, //dont send "/socket.io/socket.io.js" to front in GET
});
import("#MAIN_FOLDER/sockets/socket.js");

httpServer.listen(process.env.PORT, (error) => {
  if (error) {
    console.error(`startServer CATCH => ${error.name}: ${error.message}.`);
  }

  console.log(
    `${new Date().toISOString()} <=> Ejecutando Servidor en: ${JSON.parse(
      process.env.BASE_URL
    ).join("; ")}.`
  );
});
