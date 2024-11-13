import fs from "fs";
import {resolve} from "path";

import {Llamador} from "#MAIN_FOLDER/models/llamador.js";

class Persona {
  constructor(nombre, box) {
    this.nombre = nombre;
    this.box = box;
  }
}

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
      console.error("Error - LlamadorControl-addPersonaEspera: ", error);
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
      console.error("Error - LlamadorControl-llamarSiguientePersona: ", error);
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
      console.error("Error - LlamadorControl-llamarPersona: ", error);
    }
  }

  async cargarData() {
    try {
      // fecha DATA NO EXISTE
      let ahora = new Date();
      if (!this.fecha) {
        // Buscar data en DB
        if (process.env.URLDB) {
          try {
            let DB = await Llamador.aggregate()
              .match({
                fecha: {
                  // fecha de hoy
                  $gte: `${ahora.toISOString().slice(0, 10)}T00:00:00.000Z`,
                  $lte: `${ahora.toISOString().slice(0, 10)}T23:59:59.999Z`,
                },
              })
              .project({_id: 0})
              .exec();
            // #########
            // VER FILTRO DE FECHA
            console.log("DESARROLLO read DB", DB);
            // #########
            if (DB.length > 0) {
              console.log("ohh yeah! a recorrer el array y mandarlo al this.fecha & this.data...");
            }
          } catch (error) {
            // fallo la consulta a la DB
            // console.error("Llamador.aggregate: ", error);
          }
        }
        // Buscar data en file
        try {
          let file = await fs.promises.readFile(
            resolve(process.env.MAIN_FOLDER, `./data/llamador.json`),
            "utf8"
          );
          file = JSON.parse(file);
          // no existe DB pero si existe file y es actual -> actualiza
          if (!this.fecha && file.fecha?.slice(0, 10) === ahora.toISOString().slice(0, 10)) {
            this.fecha = file.fecha;
            this.data = file.data;
            console.log(`${ahora.toISOString()} <=> Se han cargado los datos locales.`);
          }
          // existe DB y file actual tambien -> Comparar fecha y dejar mas actual.
          else if (
            this.fecha &&
            file.fecha?.slice(0, 10) === ahora.toISOString().slice(0, 10) &&
            new Date(file.fecha).getTime() > new Date(this.fecha).getTime()
          ) {
            this.fecha = file.fecha;
            this.data = file.data;
            console.log(`${ahora.toISOString()} <=> Se han cargado los datos locales.`);
          }
          // no hay file actual -> reinicia
          else {
            this.reiniciarData();
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            // console.error("File not found:", error.path);
          } else {
            console.error("Error - LlamadorControl-cargarData readFile: ", error);
          }
          // si no existe file y tampoco DB -> reinicia
          if (!this.fecha) {
            this.reiniciarData();
          }
          return;
        }
      }
      // fecha DATA existe y es diferente de HOY
      else if (this.fecha?.slice(0, 10) !== ahora.toISOString().slice(0, 10)) {
        this.reiniciarData();
        return;
      }
      // fecha DATA existe y es HOY
      // NO EJECUTA NADA
      return;
    } catch (error) {
      console.error("Error - LlamadorControl-cargarData: ", error);
      if (!this.fecha || this.fecha.slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
        this.reiniciarData();
      }
      return;
    }
  }

  reiniciarData() {
    try {
      this.data = {};

      console.log(`${new Date().toISOString()} <=> Se han reiniciado los datos.`);
      this.grabarData();
    } catch (error) {
      console.error("Error - LlamadorControl-reiniciarData: ", error);
    }
  }

  grabarData() {
    try {
      let ahora = new Date();
      // grabar data en DB
      if (process.env.URLDB) {
        try {
          // recorre areas
          Object.keys(this.data).forEach((key) => {
            //   crear un documento por dia, si es mismo dia actualizarlo.
            let DB = Llamador.findOneAndUpdate(
              {
                fecha: {
                  // fecha de hoy
                  $gte: `${ahora.toISOString().slice(0, 10)}T00:00:00.000Z`,
                  $lte: `${ahora.toISOString().slice(0, 10)}T23:59:59.999Z`,
                },
                area: key,
              },
              {
                fecha: ahora.toISOString(),
                area: key,
                ultimosLlamados: this.data[key].ultimosLlamados,
                personasEsperan: this.data[key].personasEsperan,
              },
              {
                returnOriginal: false,
                runValidators: true,
                upsert: true,
                setDefaultsOnInsert: true,
              }
            ).exec();
            // #########
            // DESARROLLAR PARA QUE SOLO GUARDE UNA DE LAS AREAS SEGUN LA OPCION DE LA OPERACION... (Pasar area como parametro)
            console.log("DESARROLLO Update DB", key, DB);
            // #########
          });
        } catch (error) {
          // fallo la consulta a la DB
          // #########
          console.error("Llamador.findOneAndUpdate: ", error);
          // #########
        }
      }

      // grabar data en file
      fs.writeFile(
        resolve(process.env.MAIN_FOLDER, `./data/llamador.json`),
        JSON.stringify({
          fecha: ahora.toISOString(),
          data: this.data,
        }),
        {encoding: "utf8", flag: "w"},
        (error) => {
          if (error) {
            console.error("Error - LlamadorControl-grabarData writeFile: ", error);
          }
        }
      );
    } catch (error) {
      console.error("Error - LlamadorControl-grabarData: ", error);
    }
  }
}
