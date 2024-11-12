// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has("area")) {
  window.location = "index.html";
  alert("El area es necesaria.");
}
if (!searchParams.has("boxName")) {
  window.location = "index.html";
  alert("El consultorio es necesario.");
}
const area = searchParams.get("area")?.trim().toLowerCase();
const boxName = searchParams.get("boxName")?.trim().toLowerCase();

const socket = io("/llamador", {
  query: {
    area,
  },
});
document.getElementById("lblBox").innerText = `${boxName ?? "..."}`;

let llamadaLabel = document.getElementById("lblPersonaLlamada");

socket.emit("getUltimosLlamados", null, (resp) => {
  // console.log(resp);
});

// cargar el ultimo que se llamo desde el box
socket.on("ultimosLlamados", (data) => {
  llamadaLabel.innerText = `${
    data?.ultimosLlamados?.find?.((persona) => persona.box === boxName)?.nombre ?? "...."
  }`;
});

let personaInput = document.getElementById("personaInput");
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (personaInput.value) {
    socket.emit("llamarPersona", {nombre: personaInput.value, box: boxName}, (resp) => {
      personaInput.value = "";
      llamadaLabel.innerText = `${resp?.nombre ?? "...."}`;
    });
  }
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
