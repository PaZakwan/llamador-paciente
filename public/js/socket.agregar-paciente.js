// Comando para establecer la conexión
var socket = io();

var label = $("#lblUltimoPacienteAgregado");

// socket.on("connect", () => {
//   console.log("Conectado al servidor");
// });

// socket.on("disconnect", () => {
//   console.log("Desconectado del servidor");
// });

// on 'estadoActual'
socket.on("estadoActual", (resp) => {
  // console.log(resp);
  label.text("Paciente: " + resp.ultimoAgregado);
});

var paciente = document.getElementById("pacienteInput");

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (paciente.value) {
    socket.emit("agregarPaciente", {nombre: paciente.value}, (pacienteAgregado) => {
      paciente.value = "";
      label.text("Paciente: " + pacienteAgregado);
    });
  }
});

// si ya esta atendido sigue apareciendo como ultimo...
// agregar lista de Espera (cantidad de pacientes.., que pacientes.. tabla?)
