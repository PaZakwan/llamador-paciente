// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io("/llamador");

let searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("consultorio")) {
  window.location = "index.html";
  throw new Error("El consultorio es necesario");
}

let consultorio = searchParams.get("consultorio")?.trim().toLowerCase();
document.getElementById("lblConsultorio").innerText = `Consultorio: ${consultorio ?? "..."}`;

let atendiendoLabel = document.getElementById("lblPacienteAtendiendo");

// cargar el ultimo que se esta atendiendo si sale y vuelve a ingresar al consultorio
socket.on("estadoActual", (resp) => {
  atendiendoLabel.innerText = `${
    resp?.ultimosAtendidos4?.find?.((paciente) => paciente.consultorio === consultorio)?.nombre ??
    "...."
  }`;
});

document.getElementById("atenderSiguiente")?.on("click", () => {
  socket.emit("atenderSiguientePaciente", {consultorio}, (resp) => {
    if (resp === "No hay más Pacientes en Espera") {
      alert(resp);
      return;
    }
    atendiendoLabel.innerText = `${resp?.nombre ?? "...."}`;
  });
});

let pacienteInput = document.getElementById("pacienteInput");
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (pacienteInput.value) {
    socket.emit(
      "atenderPaciente",
      {nombre: pacienteInput.value, consultorio: consultorio},
      (resp) => {
        pacienteInput.value = "";
        atendiendoLabel.innerText = `${resp?.nombre ?? "...."}`;
      }
    );
  }
});
