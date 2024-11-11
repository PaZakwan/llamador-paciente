const mongoose = require("mongoose");

// ############
// DESARROLLAR / REVISAR
// Conexion a MongoDB
// ############

if (process.env.NODE_ENV === "dev") {
  mongoose.set("debug", true);
}
mongoose.set("allowDiskUse", true);

// config default connection
mongoose.connection
  .on("error", function (err) {
    // Primer conexion falla
    mensajeReintentando("Default");
    // console.error(`mongoose.connect ERROR (Default), ${err.name}: ${err.message}.`);
    // let defaultConnection = this;
    // intenta reconectar pasados los 20 seg de un error
    setTimeout(function () {
      // console.log("****** mongoose Default models", defaultConnection.models);
      mongoose.connect(process.env.URLDB, JSON.parse(process.env.DBoptions)).catch((err) => {});
      // }, 20 * 1000);
    }, 5 * 1000);
  })
  .on("connected", function () {
    mensajeONLINE("Default");
  })
  .on("disconnected", () => {
    mensajeOFFLINE("Default");
  });

// FUNCION PARA INICIAR CONEXION A LA BD MONGO
const startConnectionDB = async () => {
  try {
    // BASE
    mongoose.connect(process.env.URLDB, JSON.parse(process.env.DBoptions)).catch((err) => {});

    // UPLOAD
    mongoose.upload = await crearNuevaConexion(
      process.env.URLDB,
      {
        ...JSON.parse(process.env.DBoptions),
        ...{maxPoolSize: 1},
      },
      "Upload"
    );
    return mongoose;
  } catch (error) {
    console.error(`startConnectionDB CATCH => ${error.name}: ${error.message}.`);
    return false;
  }
};

// FUNCION PARA CREAR OTRAS CONEXIONES A LA BD MONGO
const crearNuevaConexion = async function (dbURL, options, baseName) {
  let db = await mongoose
    .createConnection(dbURL, options)
    .on("error", function (err) {
      // Primer conexion falla
      mensajeReintentando(`${baseName}`);
      // console.error(`createConnection ERROR (${baseName}), ${err.name}: ${err.message}.`);
      let mongooseConnection = this;
      // intenta reconectar pasados los 20 seg de un error
      setTimeout(function () {
        // buscar e intentar reconectar con THIS
        // console.log(`****** mongoose.${baseName} models`, mongooseConnection.models);
        mongooseConnection.openUri(dbURL, options).catch(() => {});
        // }, 20 * 1000);
      }, 5 * 1000);
    })
    .on("connected", function () {
      mensajeONLINE(`${baseName}`);
    })
    .on("disconnected", () => {
      mensajeOFFLINE(`${baseName}`);
    })
    .asPromise()
    .catch((err) => {
      // console.error(`createConnection CATCH (${baseName}), ${err.name}: ${err.message}.`);
    });

  return db;
};

// funciones de msjs
const mensajeReintentando = function (db) {
  console.error(`~~~~~ RE-Intentando primer conexion... (${db}) ~~~~~`);
  // console.log(`mongoose.connections *Reintentando ${db}*`, mongoose.connections.length);
};
const mensajeONLINE = function (db) {
  // if (db === "Default") {
  //   console.log(`===== Servidor funcionando en: ${process.env.BASE_URL}:${process.env.PORT} =====`);
  // }
  console.log(`===== ${timeNow()} <=> Base de Datos ONLINE (${db}) =====`);
  // console.log(`mongoose.connections *ONLINE ${db}*`, mongoose.connections.length);
};
const mensajeOFFLINE = function (db) {
  console.error(`XXXXX ${timeNow()} <=> Base de Datos OFFLINE (${db}) XXXXX`);
  console.error("XXXXX Esperando Re-conectar... XXXXX");
  // console.log(`mongoose.connections *OFFLINE ${db}*`, mongoose.connections.length);
};
const timeNow = function () {
  let ahora = new Date();
  return `${ahora.getFullYear()}/${(ahora.getMonth() + 1).toString().padStart(2, 0)}/${ahora
    .getDate()
    .toString()
    .padStart(2, 0)} - ${ahora.getHours().toString().padStart(2, 0)}:${ahora
    .getMinutes()
    .toString()
    .padStart(2, 0)}`;
};

// exports
exports.startConnectionDB = startConnectionDB;
