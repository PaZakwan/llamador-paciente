// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io("/llamador");

let searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("consultorio")) {
  window.location = "index.html";
  throw new Error("El consultorio es necesario.");
}

let consultorio = searchParams.get("consultorio")?.trim().toLowerCase();
document.getElementById("lblConsultorio").innerText = `${consultorio ?? "..."}`;

let llamadaLabel = document.getElementById("lblPersonaLlamada");

// cargar el ultimo que se esta atendiendo si sale y vuelve a ingresar al consultorio
socket.on("estadoActual", (resp) => {
  llamadaLabel.innerText = `${
    resp?.ultimosLlamados?.find?.((persona) => persona.box === consultorio)?.nombre ?? "...."
  }`;
});

document.getElementById("llamarSiguiente")?.on("click", () => {
  socket.emit("llamarSiguientePersona", {box: consultorio}, (resp) => {
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
    socket.emit("llamarPersona", {nombre: personaInput.value, box: consultorio}, (resp) => {
      personaInput.value = "";
      llamadaLabel.innerText = `${resp?.nombre ?? "...."}`;
    });
  }
});
