const {io} = require("../server");
const {PacienteControl} = require("../classes/paciente-control");

const pacienteControl = new PacienteControl();

io.on("connection", (client) => {
  client.emit("estadoActual", {
    ultimoAgregado: pacienteControl.getUltimoAgregadoPaciente(),
    ultimosAtendidos4: pacienteControl.getUltimosAtendidos4(),
  });

  client.on("atenderPaciente", (data, callback) => {
    try {
      if (!data.consultorio) {
        return callback({
          err: true,
          mensaje: "El Consultorio es necesario",
        });
      }

      if (!data.nombre) {
        return callback({
          err: true,
          mensaje: "El Nombre del Paciente es necesario",
        });
      }

      let atenderPaciente = pacienteControl.atenderPaciente({
        nombre: data.nombre,
        consultorio: data.consultorio,
      });

      callback(atenderPaciente);

      console.log("atenderPaciente: ", atenderPaciente);
      // actualizar/ notificar cambios en los ULTIMOS 4 ATENDIDOS
      client.broadcast.emit("ultimosAtendidos4", {
        ultimosAtendidos4: pacienteControl.getUltimosAtendidos4(),
      });
    } catch (error) {
      console.log("atenderPaciente: ", error);
    }
  });

  client.on("agregarPaciente", (data, callback) => {
    try {
      if (!data.nombre) {
        return callback({
          err: true,
          mensaje: "El nombre es necesario",
        });
      }

      let agregado = pacienteControl.agregar(data.nombre);

      callback(agregado);
      console.log("agregarPaciente: ", agregado);
    } catch (error) {
      console.log("agregarPaciente: ", error);
    }
  });

  client.on("atenderSiguientePaciente", (data, callback) => {
    try {
      if (!data.consultorio) {
        return callback({
          err: true,
          mensaje: "El Consultorio es necesario",
        });
      }

      let atenderSiguientePaciente = pacienteControl.atenderSiguientePaciente(data.consultorio);

      callback(atenderSiguientePaciente);

      console.log("atenderSiguientePaciente: ", atenderSiguientePaciente);
      // actualizar/ notificar cambios en los ULTIMOS 4 ATENDIDOS
      client.broadcast.emit("ultimosAtendidos4", {
        ultimosAtendidos4: pacienteControl.getUltimosAtendidos4(),
      });
    } catch (error) {
      console.log("atenderSiguientePaciente: ", error);
    }
  });
});
