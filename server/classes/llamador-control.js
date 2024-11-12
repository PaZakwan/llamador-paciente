import fs from "fs";
import {resolve} from "path";

import {Llamador} from "#MAIN_FOLDER/models/llamador.js";

class Persona {
  constructor(nombre, box) {
    this.nombre = nombre;
    this.box = box;
  }
}

// Al CREAR/LEER DATA comparar fecha y restear data si es otro dia.
// https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial
// AL CREAR DATA tambien conectar con MongoDB y guardar data,
// Al LEER DATA comparar fecha del json y el MongoDB para saber cual es la mas actual.

// GUARDAR BIEN LA DATA Y GG
// MongoDB
// create fecha , object.keys -> area -> ultimosLlamados , personasEsperan.
// get buscar por fecha y agruparlos :D

export class LlamadorControl {
  constructor(area = "Default") {
    this.fecha = "";
    this.data = {};
    // {
    //   "<area>": {
    //     ultimosLlamados: [],
    //     personasEsperan: [],
    //   },
    // }

    this.cargarData();
  }

  getUltimosLlamados({area}) {
    this.cargarData();
    return this.data[area]?.ultimosLlamados ?? [];
  }

  getPersonasEsperan({area}) {
    this.cargarData();
    return this.data[area]?.personasEsperan ?? [];
  }

  addPersonaEspera({area, nombre}) {
    try {
      this.cargarData();

      ((this.data[area] ??= {}).personasEsperan ??= []).push(new Persona(nombre, null));

      this.grabarData();

      return nombre;
    } catch (error) {
      console.log("Error - LlamadorControl-addPersonaEspera: ", error);
    }
  }

  llamarSiguientePersona({area, box}) {
    try {
      this.cargarData();
      if (this.data[area]?.personasEsperan.length === 0) {
        return "No hay más Personas en Espera.";
      }

      // Quitar de Espera
      let siguientePersona = this.data[area].personasEsperan.shift();
      siguientePersona = new Persona(siguientePersona.nombre, box);

      // Agregar a LLamados
      (this.data[area].ultimosLlamados ??= []).unshift(siguientePersona);
      // Solamente los ultimos 4 LLamados se guardan
      if (this.data[area].ultimosLlamados.length > 4) {
        this.data[area].ultimosLlamados.splice(-1, 1); // borra el último
      }

      this.grabarData();

      return siguientePersona;
    } catch (error) {
      console.log("Error - LlamadorControl-llamarSiguientePersona: ", error);
    }
  }

  llamarPersona({area, nombre, box}) {
    try {
      this.cargarData();
      let personaLlamada = new Persona(nombre, box);

      // Agregar a LLamados
      ((this.data[area] ??= {}).ultimosLlamados ??= []).unshift(personaLlamada);
      // Solamente los ultimos 4 LLamados se guardan
      if (this.data[area].ultimosLlamados.length > 4) {
        this.data[area].ultimosLlamados.splice(-1, 1); // borra el último
      }

      this.grabarData();

      return personaLlamada;
    } catch (error) {
      console.log("Error - LlamadorControl-llamarPersona: ", error);
    }
  }

  cargarData() {
    try {
      if (!this.fecha) {
        // fecha DATA NO EXISTE
        fs.readFile(
          resolve(process.env.MAIN_FOLDER, `./data/llamador.json`),
          "utf8",
          (err, file) => {
            if (err) {
              if (err.code === "ENOENT") {
                // console.error("File not found:", err.path);
              } else {
                console.log("Error - LlamadorControl-cargarData readFile: ", err);
              }
              this.reiniciarData();
              return;
            }
            file = JSON.parse(file);
            // si existe file y es actual se actualiza
            if (file.fecha?.slice(0, 10) === new Date().toISOString().slice(0, 10)) {
              this.fecha = file.fecha;
              this.data = file.data;
              console.log(`${new Date().toISOString()} <=> Se han cargado los datos locales.`);
            } else {
              this.reiniciarData();
            }
          }
        );
      }
      // fecha DATA existe y es diferente de HOY
      else if (this.fecha?.slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
        this.reiniciarData();
      }
      // fecha DATA existe y es HOY
      // NO EJECUTA NADA
    } catch (error) {
      console.log("Error - LlamadorControl-cargarData: ", error);
      this.reiniciarData();
    }
  }

  reiniciarData() {
    try {
      this.data = {};

      console.log(`${new Date().toISOString()} <=> Se han reiniciado los datos.`);
      this.grabarData();
    } catch (error) {
      console.log("Error - LlamadorControl-reiniciarData: ", error);
    }
  }

  grabarData() {
    try {
      let jsonDataString = JSON.stringify({
        fecha: new Date().toISOString(),
        data: this.data,
      });

      fs.writeFile(
        resolve(process.env.MAIN_FOLDER, `./data/llamador.json`),
        jsonDataString,
        {encoding: "utf8"},
        (err) => {
          if (err) {
            console.log("Error - LlamadorControl-grabarData writeFile: ", err);
            return;
          }
        }
      );
    } catch (error) {
      console.log("Error - LlamadorControl-grabarData: ", error);
    }
  }
}
