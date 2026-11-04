// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV ?? "dev";

// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT ?? (process.env.NODE_ENV === "dev" ? 80 : 3030);

// ============================
//  IP LOCAL O SERVIDOR
// ============================

if (process.env.BASE_URL) {
  process.env.BASE_URL = JSON.stringify([`${process.env.BASE_URL}:${process.env.PORT}`]);
} else {
  const {networkInterfaces} = await import("os");

  const ipServer = Object.values(networkInterfaces())
    .flat()
    .filter(({family, internal}) => family === "IPv4" && !internal)
    .map(({address}) => `${address}:${process.env.PORT}`);

  process.env.BASE_URL = JSON.stringify(ipServer);
}

// ============================
//  SUBRUTA_APP
// ============================

// "sub_folder"
process.env.SUBRUTA_APP = process.env.SUBRUTA_APP ?? "/";
process.env.SUBRUTA_APP = `/${process.env.SUBRUTA_APP.replace(/^\/|\/$/g, "")}`;

// ============================
//  Base de datos
// ============================
// Dejar string vacio ("") si no quiere conectar/reconectar a mongoDB (logs)
process.env.URLDB = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/test-llamador";
// bufferCommands: Tiempo de espera en la ejecucion de las query de mongo, no espera antes de retornar un error.
// family: 4; No intenta conectar con IPv6.
// serverSelectionTimeoutMS: Tiempo en retornar error de reconexion (30s).
// heartbeatFrequencyMS: Cada cuanto consulta el estado de conectividad (30s)
// journal: true; Fuerza a escribir en el Journal (disco duro) antes de responder "OK".
process.env.DBoptions = JSON.stringify({
  bufferCommands: false,
  autoIndex: false,
  family: 4,
  serverSelectionTimeoutMS: 8 * 1000,
  heartbeatFrequencyMS: 10 * 1000,
  journal: true,
});

// ============================
//  Certificados SSL/TLS
// ============================
// import {resolve} from "path";

// process.env.KEY = resolve(process.env.MAIN_FOLDER, "./cert/ssalud.key.pem");
// process.env.CERT = resolve(process.env.MAIN_FOLDER, "./cert/ssalud.crt.pem");
// process.env.DH = resolve(process.env.MAIN_FOLDER, "./cert/dhparam.pem");

// ============================
//  Vencimiento del Token
// ============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
// process.env.TOKEN_EXPIRE = process.env.TOKEN_EXPIRE ?? "2h";

// ============================
// Token SEED de autentificacion
// ============================
// process.env.TOKEN_SEED = process.env.TOKEN_SEED ?? "seed-desarrollo-wololo";

// ============================
//  Configuracion de CORS
// ============================
// ###
// Revisar porque cambie process.env.BASE_URL(ahora es un array de las ip/direcciones del servidor..)
// ###
// process.env.CORS = JSON.stringify({
//   // origin: "*",
//   origin: [
//     `http://${process.env.BASE_URL}`,
//     `http://${process.env.BASE_URL}:${process.env.PORT}`,
//     `http://${process.env.BASE_URL}:80`,
//     "http://localhost",
//     `http://localhost:${process.env.PORT}`,
//     "http://localhost:80",
//     "http://localhost:8080", //VUE develop
//     `http://${process.env.BASE_URL}:8080`, //VUE develop
//     `https://${process.env.BASE_URL}`,
//     `https://${process.env.BASE_URL}:${process.env.PORT}`,
//     `https://${process.env.BASE_URL}:443`,
//     "https://localhost",
//     `https://localhost:${process.env.PORT}`,
//     "https://localhost:443",
//     "https://localhost:8080", //VUE develop
//     `https://${process.env.BASE_URL}:8080`, //VUE develop
//   ], //servidor que deseas que consuma (FrontEnd) o (*) en caso que sea acceso libre
//   credentials: true,
//   methods: ["OPTIONS", "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
//   allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization", "TimezoneOffset", "token"],
//   optionsSuccessStatus: 200,
// });
