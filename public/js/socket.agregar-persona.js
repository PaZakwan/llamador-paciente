import {obtenerConfig} from "./get-config.js";

const config = await obtenerConfig();

const socket = io("/llamador", {
  path: config.io_path,
  query: {
    area,
  },
  autoConnect: true,
  reconnectionAttempts: 5,
});

let ultimoAgregadoLabel = document.getElementById("lblUltimaPersonaAgregada");

// ###############
// EN DESARROLLO
// ###############

// socket.on("connect", () => {
//   console.log("Conectado al servidor");
// });

// socket.on("disconnect", () => {
//   console.log("Desconectado del servidor");
// });

// on 'estadoActual'
socket.on("estadoActual", (resp) => {
  // console.log(resp);
  ultimoAgregadoLabel.innerText = `Paciente: ${resp?.personasEsperan ?? "...."}`;
});

let personaInput = document.getElementById("personaInput");

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (personaInput.value) {
    socket.emit("addPersonaEspera", {nombre: personaInput.value}, (personagregada) => {
      personaInput.value = "";
      ultimoAgregadoLabel.innerText = `Paciente: ${personagregada ?? "...."}`;
    });
  }
});

// si ya esta atendido sigue apareciendo como ultimo...
// agregar lista de Espera (cantidad de pacientes.., que pacientes.. tabla?)
