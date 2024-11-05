// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io();

let ultimoAgregadoLabel = document.getElementById("lblUltimoPacienteAgregado");

// socket.on("connect", () => {
//   console.log("Conectado al servidor");
// });

// socket.on("disconnect", () => {
//   console.log("Desconectado del servidor");
// });

// on 'estadoActual'
socket.on("estadoActual", (resp) => {
  // console.log(resp);
  ultimoAgregadoLabel.innerText = `Paciente: ${resp?.ultimoAgregado ?? "...."}`;
});

let pacienteInput = document.getElementById("pacienteInput");

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (pacienteInput.value) {
    socket.emit("agregarPaciente", {nombre: pacienteInput.value}, (pacienteAgregado) => {
      pacienteInput.value = "";
      ultimoAgregadoLabel.innerText = `Paciente: ${pacienteAgregado ?? "...."}`;
    });
  }
});

// si ya esta atendido sigue apareciendo como ultimo...
// agregar lista de Espera (cantidad de pacientes.., que pacientes.. tabla?)
