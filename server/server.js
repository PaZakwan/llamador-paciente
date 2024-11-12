import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";

// Variable global para la ruta donde corre el server
import {resolve} from "path";
process.env.MAIN_FOLDER = resolve(import.meta.dirname);

// Variables de Configuracion
await import("#MAIN_FOLDER/config.js");

// Creando y configurando WebServer
const app = express();
const httpServer = createServer(app);

app.use(express.static(resolve(process.env.MAIN_FOLDER, "../public")));

// MONGODB CONEXIONES DB
const {startConnectionDB} = await import("#MAIN_FOLDER/db_connection.js");
const DB = await startConnectionDB();

// SOCKET IO = esta es la comunicacion del backend (add Socket listen en el WebServer)
export const io = new Server(httpServer, {
  /* options */
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  // serveClient: false, //dont send "/socket.io/socket.io.js" to front in GET
});
// Cargando Eventos
import("#MAIN_FOLDER/sockets/socket.js");

// Crea los INDEX de la BD.
const index = await DB.syncIndexes({continueOnError: true});

// Ejecutando WebServer
httpServer.listen(process.env.PORT, (error) => {
  if (error) {
    console.error(`startServer CATCH => ${error.name}: ${error.message}.`);
  }

  console.log(
    `===== ${new Date().toISOString()} <=> Ejecutando Servidor en: ${JSON.parse(
      process.env.BASE_URL
    ).join("; ")}. =====`
  );
});
