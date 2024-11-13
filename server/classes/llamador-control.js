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
  constructor() {
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

      this.grabarData({area});

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

      this.grabarData({area});

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

      this.grabarData({area});

      return personaLlamada;
    } catch (error) {
      console.error("Error - LlamadorControl-llamarPersona: ", error);
    }
  }

  async cargarData() {
    try {
      let ahora = new Date();
      // fecha DATA existe y es HOY -> NO EJECUTA NADA
      if (this.fecha?.slice(0, 10) === ahora.toISOString().slice(0, 10)) {
        return;
      }
      // fecha DATA existe y es diferente de HOY -> Reiniciar Data
      else if (this.fecha) {
        this.reiniciarData();
        return;
      }
      // fecha DATA NO EXISTE
      else {
        // Buscar data en DB
        let DB = null;
        if (process.env.URLDB) {
          try {
            DB = await Llamador.aggregate()
              .match({
                fecha: {
                  // fecha de hoy
                  $gte: new Date(`${ahora.toISOString().slice(0, 10)}T00:00:00.000Z`),
                  $lte: new Date(`${ahora.toISOString().slice(0, 10)}T23:59:59.999Z`),
                },
              })
              .sort({fecha: -1})
              .project({_id: 0, __v: 0})
              .exec();
          } catch (error) {
            // fallo la consulta a la DB
            console.error("Error - LlamadorControl-cargarData aggregate: ", error);
            DB = null;
          }
        }
        // Buscar data en file
        let file = null;
        try {
          file = await fs.promises.readFile(
            resolve(process.env.MAIN_FOLDER, `./data/llamador.json`),
            "utf8"
          );
          file = JSON.parse(file);
          // borrar file si no es ACTUAL
          if (file?.fecha?.slice(0, 10) !== ahora.toISOString().slice(0, 10)) {
            file = null;
          }
        } catch (error) {
          if (error.code === "ENOENT") {
            // console.error("File not found:", error.path);
          } else {
            console.error("Error - LlamadorControl-cargarData readFile: ", error);
          }
          file = null;
        }
        // Comparar file y DB
        // file existe, DB existe -> Compararlos -> Actualizar Mas Actual
        if (file && DB?.length > 0) {
          if (new Date(file.fecha).getTime() >= DB[0].fecha?.getTime()) {
            this.fecha = file.fecha;
            this.data = file.data;
            console.log(`${ahora.toISOString()} <=> Se han cargado los datos locales.`);
            return;
          } else {
            this.fecha = DB[0].fecha?.toISOString();
            DB.forEach((document) => {
              if (document.ultimosLlamados) {
                (this.data[document.area] ??= {}).ultimosLlamados = document.ultimosLlamados;
              }
              if (document.personasEsperan) {
                (this.data[document.area] ??= {}).personasEsperan = document.personasEsperan;
              }
            });
            console.log(`${ahora.toISOString()} <=> Se han cargado los datos de la DB.`);
            return;
          }
        }
        // file existe, DB no existe -> Actualizar con file
        else if (file && !DB?.length > 0) {
          this.fecha = file.fecha;
          this.data = file.data;
          console.log(`${ahora.toISOString()} <=> Se han cargado los datos locales.`);
          return;
        }
        // file no existe, DB existe -> Actualizar con DB
        else if (!file && DB?.length > 0) {
          this.fecha = DB[0].fecha?.toISOString();
          DB.forEach((document) => {
            if (document.ultimosLlamados) {
              (this.data[document.area] ??= {}).ultimosLlamados = document.ultimosLlamados;
            }
            if (document.personasEsperan) {
              (this.data[document.area] ??= {}).personasEsperan = document.personasEsperan;
            }
          });
          console.log(`${ahora.toISOString()} <=> Se han cargado los datos de la DB.`);
          return;
        }
        // file no existe, DB no existe -> Reiniciar Data
        else {
          this.reiniciarData();
          return;
        }
      }
    } catch (error) {
      console.error("Error - LlamadorControl-cargarData: ", error);
      // no hay fecha o la fecha no es actual
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

  grabarData({area = null} = {}) {
    try {
      let ahora = new Date();
      // grabar data en DB
      if (process.env.URLDB) {
        try {
          // recorrer areas de this.data [{<area>:{}}] si area seleccionada (parametro de la funcion) no existe
          (area ? [area] : Object.keys(this.data)).forEach((key) => {
            //   crear un documento por dia, si es del mismo dia actualizarlo.
            Llamador.findOneAndUpdate(
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
                // returnOriginal: false,
                runValidators: true,
                upsert: true,
                setDefaultsOnInsert: true,
              }
            ).exec();
          });
        } catch (error) {
          // fallo la consulta a la DB
          console.error("Error - LlamadorControl-grabarData findOneAndUpdate: ", error);
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
