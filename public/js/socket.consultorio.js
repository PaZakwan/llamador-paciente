// Comando para establecer la conexión
var socket = io();

var searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("consultorio")) {
  window.location = "index.html";
  throw new Error("El consultorio es necesario");
}

var consultorio = searchParams.get("consultorio");
$("#lblConsultorio").text("Consultorio: " + consultorio);

var atendiendo = $("small");

// cargar el ultimo que se esta atendiendo si sale y vuelve a ingresar al consultorio
socket.on("estadoActual", (resp) => {
  atendiendo.text(
    resp.ultimosAtendidos4.find((paciente) => paciente.consultorio === consultorio)?.nombre ||
      "----"
  );
});

$("#atenderSiguiente").on("click", () => {
  socket.emit("atenderSiguientePaciente", {consultorio: consultorio}, (resp) => {
    if (resp === "No hay más Pacientes en Espera") {
      alert(resp);
      return;
    }
    atendiendo.text(resp.nombre);
  });
});

var paciente = document.getElementById("pacienteInput");
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (paciente.value) {
    socket.emit("atenderPaciente", {nombre: paciente.value, consultorio: consultorio}, (resp) => {
      paciente.value = "";
      atendiendo.text(resp.nombre);
    });
  }
});
