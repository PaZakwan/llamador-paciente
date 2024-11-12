// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io("/llamador");

let searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("boxName")) {
  window.location = "index.html";
  alert("El consultorio es necesario.");
}

let boxName = searchParams.get("boxName")?.trim().toLowerCase();
document.getElementById("lblBox").innerText = `${boxName ?? "..."}`;

let llamadaLabel = document.getElementById("lblPersonaLlamada");

// cargar el ultimo que se esta atendiendo si sale y vuelve a ingresar al box
socket.on("estadoActual", (resp) => {
  llamadaLabel.innerText = `${
    resp?.ultimosLlamados?.find?.((persona) => persona.box === boxName)?.nombre ?? "...."
  }`;
});

document.getElementById("llamarSiguiente")?.on("click", () => {
  socket.emit("llamarSiguientePersona", {box: boxName}, (resp) => {
    if (resp === "No hay más Personas en Espera.") {
      alert(resp);
      return;
    }
    llamadaLabel.innerText = `${resp?.nombre ?? "...."}`;
  });
});

let personaInput = document.getElementById("personaInput");
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (personaInput.value) {
    socket.emit("llamarPersona", {nombre: personaInput.value, box: boxName}, (resp) => {
      personaInput.value = "";
      llamadaLabel.innerText = `${resp?.nombre ?? "...."}`;
    });
  }
});
