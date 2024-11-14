// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV ?? "dev";

// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT ?? 80;

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
//  Base de datos
// ============================
// Dejar string vacio ("") si no quiere conectar/reconectar a mongoDB (logs)
process.env.URLDB = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/test-llamador";
// serverSelectionTimeoutMS: Tiempo en retornar error de reconexion.
// bufferCommands: Tiempo de espera en la ejecucion de las query de mongo, no espera antes de retornar un error.
// family: 4; No intenta conectar con IPv6.
process.env.DBoptions = JSON.stringify({
  serverSelectionTimeoutMS: 8 * 1000,
  bufferCommands: false,
  family: 4,
  autoIndex: false,
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
//     "http://ssaludmoreno.onrender.com",
//     "http://www.ssaludmoreno.com",
//     "http://www.secretariadesaludmoreno.com",
//     "http://192.168.185.9",
//     "http://192.168.104.6",
//     `https://${process.env.BASE_URL}`,
//     `https://${process.env.BASE_URL}:${process.env.PORT}`,
//     `https://${process.env.BASE_URL}:443`,
//     "https://localhost",
//     `https://localhost:${process.env.PORT}`,
//     "https://localhost:443",
//     "https://localhost:8080", //VUE develop
//     `https://${process.env.BASE_URL}:8080`, //VUE develop
//     "https://ssaludmoreno.onrender.com",
//     "https://www.ssaludmoreno.com",
//     "https://www.secretariadesaludmoreno.com",
//     "https://192.168.185.9",
//     "https://192.168.104.6",
//     "https://www.google.com",
//   ], //servidor que deseas que consuma(FrontEnd) o (*) en caso que sea acceso libre
//   credentials: true,
//   methods: ["OPTIONS", "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
//   allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization", "TimezoneOffset", "token"],
//   optionsSuccessStatus: 200,
// });
