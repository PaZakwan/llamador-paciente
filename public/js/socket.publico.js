// Comando para establecer la conexión
const socket = io();

var lblPaciente1 = $("#lblPaciente1");
var lblPaciente2 = $("#lblPaciente2");
var lblPaciente3 = $("#lblPaciente3");
var lblPaciente4 = $("#lblPaciente4");

var lblConsultorio1 = $("#lblConsultorio1");
var lblConsultorio2 = $("#lblConsultorio2");
var lblConsultorio3 = $("#lblConsultorio3");
var lblConsultorio4 = $("#lblConsultorio4");

var lblPacientes = [lblPaciente1, lblPaciente2, lblPaciente3, lblPaciente4];
var lblConsultorios = [lblConsultorio1, lblConsultorio2, lblConsultorio3, lblConsultorio4];

const audio = new Audio("audio/new-paciente.mp3");
var CheckSound = $("#CheckSound");
socket.on("estadoActual", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data.ultimosAtendidos4);
});

socket.on("ultimosAtendidos4", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data.ultimosAtendidos4);
});

function actualizaHTML(ultimosAtendidos4) {
  for (var i = 0; i <= ultimosAtendidos4.length - 1; i++) {
    lblConsultorios[i].text(`Consultorio: ${ultimosAtendidos4[i].consultorio}`);
    lblPacientes[i].text(`Paciente: ${ultimosAtendidos4[i].nombre}`);
  }
}

function playSound() {
  if (CheckSound.is(":checked")) {
    audio.play().catch(function (error) {
      if (CheckSound.is(":checked")) {
        CheckSound.removeAttr("checked");
      }
    });
  }
}
