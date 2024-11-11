import fs from "fs";
import {resolve} from "path";

class Paciente {
  constructor(nombre, consultorio) {
    this.nombre = nombre;
    this.consultorio = consultorio;
  }
}

// Al CREAR/LEER DATA comparar fecha y restear data si es otro dia.
// https://www.mongodb.com/resources/languages/express-mongodb-rest-api-tutorial
// AL CREAR DATA tambien conectar con MongoDB y guardar data,
// Al LEER DATA comparar fecha del json y el MongoDB para saber cual es la mas actual.

export class PacienteControl {
  constructor() {
    this.hoy = "";
    this.ultimoAgregado = "...";
    this.pacientesEspera = [];
    this.ultimosAtendidos4 = [];

    this.cargarData();
  }

  getUltimoAgregadoPaciente() {
    this.cargarData();
    return this.ultimoAgregado;
  }

  getPacientesEspera() {
    this.cargarData();
    return this.pacientesEspera;
  }

  getUltimosAtendidos4() {
    this.cargarData();
    return this.ultimosAtendidos4;
  }

  agregar(nombre) {
    try {
      this.cargarData();
      this.ultimoAgregado = nombre;

      let paciente = new Paciente(this.ultimoAgregado, null);
      this.pacientesEspera.push(paciente);

      this.grabarData();

      return this.ultimoAgregado;
    } catch (error) {
      console.log("Error - PacienteControl-agregar: ", error);
    }
  }

  atenderSiguientePaciente(consultorio) {
    try {
      this.cargarData();
      if (this.pacientesEspera.length === 0) {
        return "No hay más Pacientes en Espera";
      }

      let nombrePaciente = this.pacientesEspera[0].nombre;
      this.pacientesEspera.shift();

      let atenderSiguientePaciente = new Paciente(nombrePaciente, consultorio);

      this.ultimosAtendidos4.unshift(atenderSiguientePaciente);

      if (this.ultimosAtendidos4.length > 4) {
        this.ultimosAtendidos4.splice(-1, 1); // borra el último
      }

      this.grabarData();

      return atenderSiguientePaciente;
    } catch (error) {
      console.log("Error - PacienteControl-atenderSiguientePaciente: ", error);
    }
  }

  atenderPaciente(paciente) {
    try {
      this.cargarData();
      let atenderPaciente = new Paciente(paciente.nombre, paciente.consultorio);

      this.ultimosAtendidos4.unshift(atenderPaciente);

      if (this.ultimosAtendidos4.length > 4) {
        this.ultimosAtendidos4.splice(-1, 1); // borra el último
      }

      this.grabarData();

      return atenderPaciente;
    } catch (error) {
      console.log("Error - PacienteControl-atenderPaciente: ", error);
    }
  }

  cargarData() {
    try {
      if (!this.hoy) {
        // HOY DATA NO EXISTE
        fs.readFile(resolve(process.env.MAIN_FOLDER, "./data/data.json"), "utf8", (err, data) => {
          if (err) {
            if (err.code === "ENOENT") {
              // console.error("File not found:", err.path);
            } else {
              console.log("Error - PacienteControl-cargarData readFile: ", err);
            }
            this.reiniciarData();
            return;
          }
          data = JSON.parse(data);
          // si existe data y es actual se actualiza
          if (data.hoy?.slice(0, 10) === new Date().toISOString().slice(0, 10)) {
            this.hoy = data.hoy;
            this.ultimoAgregado = data.ultimoAgregado;
            this.pacientesEspera = data.pacientesEspera;
            this.ultimosAtendidos4 = data.ultimosAtendidos4;
            console.log(`${new Date().toISOString()} <=> Se han cargado los datos locales.`);
          } else {
            this.reiniciarData();
          }
        });
      }
      // HOY DATA existe y es diferente de HOY AHORA :V
      else if (this.hoy?.slice(0, 10) !== new Date().toISOString().slice(0, 10)) {
        this.reiniciarData();
      }
      // HOY DATA existe y es HOY AHORA :V
      // NO EJECUTA NADA
    } catch (error) {
      console.log("Error - PacienteControl-cargarData: ", error);
      this.reiniciarData();
    }
  }

  reiniciarData() {
    try {
      this.ultimoAgregado = "...";
      this.pacientesEspera = [];
      this.ultimosAtendidos4 = [];

      console.log(`${new Date().toISOString()} <=> Se han reiniciado los datos.`);
      this.grabarData();
    } catch (error) {
      console.log("Error - PacienteControl-reiniciarData: ", error);
    }
  }

  grabarData() {
    try {
      let jsonDataString = JSON.stringify({
        hoy: new Date().toISOString(),
        ultimoAgregado: this.ultimoAgregado,
        pacientesEspera: this.pacientesEspera,
        ultimosAtendidos4: this.ultimosAtendidos4,
      });

      fs.writeFile(
        resolve(process.env.MAIN_FOLDER, "./data/data.json"),
        jsonDataString,
        {encoding: "utf8"},
        (err) => {
          if (err) {
            console.log("Error - PacienteControl-grabarData writeFile: ", err);
            return;
          }
        }
      );
    } catch (error) {
      console.log("Error - PacienteControl-grabarData: ", error);
    }
  }
}
