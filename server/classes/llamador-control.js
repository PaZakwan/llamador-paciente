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

export class LlamadorControl {
  constructor(area = "Default") {
    this.area = area;
    this.fecha = "";
    this.ultimosLlamados = [];
    this.personasEsperan = [];

    this.cargarData();
  }

  getUltimosLlamados() {
    this.cargarData();
    return this.ultimosLlamados;
  }

  getPersonasEsperan() {
    this.cargarData();
    return this.personasEsperan;
  }

  addPersonaEspera(nombre) {
    try {
      this.cargarData();

      this.personasEsperan.push(new Persona(nombre, null));

      this.grabarData();

      return nombre;
    } catch (error) {
      console.log("Error - LlamadorControl-addPersonaEspera: ", error);
    }
  }

  llamarSiguientePersona(box) {
    try {
      this.cargarData();
      if (this.personasEsperan.length === 0) {
        return "No hay más Personas en Espera.";
      }

      // Quitar de Espera
      let siguientePersona = this.personasEsperan.shift();
      siguientePersona = new Persona(siguientePersona.nombre, box);

      // Agregar a LLamados
      this.ultimosLlamados.unshift(siguientePersona);

      this.grabarData();

      return siguientePersona;
    } catch (error) {
      console.log("Error - LlamadorControl-llamarSiguientePersona: ", error);
    }
  }

  llamarPersona(persona) {
    try {
      this.cargarData();
      let personaLlamada = new Persona(persona.nombre, persona.box);

      // Agregar a LLamados
      this.ultimosLlamados.unshift(personaLlamada);

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
          resolve(process.env.MAIN_FOLDER, `./data/data-${this.area}.json`),
          "utf8",
          (err, data) => {
            if (err) {
              if (err.code === "ENOENT") {
                // console.error("File not found:", err.path);
              } else {
                console.log("Error - LlamadorControl-cargarData readFile: ", err);
              }
              this.reiniciarData();
              return;
            }
            data = JSON.parse(data);
            // si existe data y es actual se actualiza
            if (data.fecha?.slice(0, 10) === new Date().toISOString().slice(0, 10)) {
              this.fecha = data.fecha;
              this.ultimosLlamados = data.ultimosLlamados;
              this.personasEsperan = data.personasEsperan;
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
      this.ultimosLlamados = [];
      this.personasEsperan = [];

      console.log(`${new Date().toISOString()} <=> Se han reiniciado los datos.`);
      this.grabarData();
    } catch (error) {
      console.log("Error - LlamadorControl-reiniciarData: ", error);
    }
  }

  grabarData() {
    try {
      // Solamente los ultimos 4 LLamados se guardan
      if (this.ultimosLlamados.length > 4) {
        this.ultimosLlamados.splice(-1, 1); // borra el último
      }

      let jsonDataString = JSON.stringify({
        fecha: new Date().toISOString(),
        ultimosLlamados: this.ultimosLlamados,
        personasEsperan: this.personasEsperan,
      });

      fs.writeFile(
        resolve(process.env.MAIN_FOLDER, `./data/data-${this.area}.json`),
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
