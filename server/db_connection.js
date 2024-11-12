import mongoose from "mongoose";

if (process.env.NODE_ENV === "dev") {
  mongoose.set("debug", true);
}
mongoose.set("allowDiskUse", true);

// config default connection
mongoose.connection
  .on("error", (err) => {
    // Primer conexion falla
    mensajeReintentando("Default");
    // console.error(`mongoose.connect ERROR (Default), ${err.name}: ${err.message}.`);
    // let defaultConnection = this;
    // intenta reconectar pasados los 20 seg de un error
    setTimeout(() => {
      // console.log("****** mongoose Default models", defaultConnection.models);
      mongoose.connect(process.env.URLDB, JSON.parse(process.env.DBoptions)).catch((err) => {});
      // }, 20 * 1000);
    }, 10 * 1000);
  })
  .on("connected", () => {
    mensajeONLINE("Default");
  })
  .on("disconnected", () => {
    mensajeOFFLINE("Default");
  });

// FUNCION PARA INICIAR CONEXION A LA BD MONGO
export const startConnectionDB = async () => {
  try {
    // BASE
    await mongoose.connect(process.env.URLDB, JSON.parse(process.env.DBoptions));

    return mongoose;
  } catch (error) {
    console.error(`startConnectionDB CATCH => ${error.name}: ${error.message}.`);
    return false;
  }
};

// funciones de msjs
const mensajeReintentando = (db) => {
  console.error(`~~~~~ RE-Intentando primer conexion... (${db}). ~~~~~`);
  // console.log(`mongoose.connections *Reintentando ${db}*`, mongoose.connections.length);
};
const mensajeONLINE = (db) => {
  // if (db === "Default") {
  //   console.log(`===== Servidor funcionando en: ${process.env.BASE_URL}:${process.env.PORT} =====`);
  // }
  console.log(`===== ${new Date().toISOString()} <=> Base de Datos ONLINE (${db}). =====`);
  // console.log(`mongoose.connections *ONLINE ${db}*`, mongoose.connections.length);
};
const mensajeOFFLINE = (db) => {
  console.error(`XXXXX ${new Date().toISOString()} <=> Base de Datos OFFLINE (${db}). XXXXX`);
  console.error("XXXXX Esperando Re-conectar... XXXXX");
  // console.log(`mongoose.connections *OFFLINE ${db}*`, mongoose.connections.length);
};
