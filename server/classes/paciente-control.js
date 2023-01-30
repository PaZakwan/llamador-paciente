const fs = require("fs");

class Paciente {
  constructor(nombre, consultorio) {
    this.nombre = nombre;
    this.consultorio = consultorio;
  }
}

class PacienteControl {
  constructor() {
    this.hoy = new Date().getDate();
    this.ultimoAgregado = 0;
    this.pacientesEspera = [];
    this.ultimosAtendidos4 = [];

    try {
      // si existe data la carga
      let data = require("../data/data.json");
      // si la data es actual la carga
      if (data.hoy === this.hoy) {
        this.ultimoAgregado = data.ultimoAgregado;
        this.pacientesEspera = data.pacientesEspera;
        this.ultimosAtendidos4 = data.ultimosAtendidos4;
      } else {
        this.reiniciarConteo();
      }
    } catch (error) {
      this.reiniciarConteo();
    }
  }

  getUltimoAgregadoPaciente() {
    return this.ultimoAgregado;
  }

  getUltimosAtendidos4() {
    return this.ultimosAtendidos4;
  }

  agregar(nombre) {
    try {
      this.ultimoAgregado = nombre;

      let paciente = new Paciente(this.ultimoAgregado, null);
      this.pacientesEspera.push(paciente);

      this.grabarArchivo();

      return this.ultimoAgregado;
    } catch (error) {
      console.log("PacienteControl-agregar: ", error);
    }
  }

  atenderSiguientePaciente(consultorio) {
    try {
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

      this.grabarArchivo();

      return atenderSiguientePaciente;
    } catch (error) {
      console.log("PacienteControl-atenderSiguientePaciente: ", error);
    }
  }

  atenderPaciente(data) {
    try {
      let atenderPaciente = new Paciente(data.nombre, data.consultorio);

      this.ultimosAtendidos4.unshift(atenderPaciente);

      if (this.ultimosAtendidos4.length > 4) {
        this.ultimosAtendidos4.splice(-1, 1); // borra el último
      }

      this.grabarArchivo();

      return atenderPaciente;
    } catch (error) {
      console.log("PacienteControl-atenderPaciente: ", error);
    }
  }

  reiniciarConteo() {
    this.ultimoAgregado = 0;
    this.pacientesEspera = [];
    this.ultimosAtendidos4 = [];

    console.log("Se ha inicializado el sistema");
    this.grabarArchivo();
  }

  grabarArchivo() {
    let jsonData = {
      ultimoAgregado: this.ultimoAgregado,
      hoy: this.hoy,
      pacientesEspera: this.pacientesEspera,
      ultimosAtendidos4: this.ultimosAtendidos4,
    };

    let jsonDataString = JSON.stringify(jsonData);

    fs.writeFileSync("./server/data/data.json", jsonDataString);
  }
}

module.exports = {
  PacienteControl,
};
