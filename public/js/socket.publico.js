// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io("/llamador");
const audio = new Audio("audio/new-paciente.mp3");

let lblPacientes = [
  document.getElementById("lblPaciente1"),
  document.getElementById("lblPaciente2"),
  document.getElementById("lblPaciente3"),
  document.getElementById("lblPaciente4"),
];
let lblConsultorios = [
  document.getElementById("lblConsultorio1"),
  document.getElementById("lblConsultorio2"),
  document.getElementById("lblConsultorio3"),
  document.getElementById("lblConsultorio4"),
];
let CheckSound = document.getElementById("CheckSound");

socket.on("estadoActual", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data?.ultimosAtendidos4);
});

socket.on("ultimosAtendidos4", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data?.ultimosAtendidos4);
});

const actualizaHTML = (ultimosAtendidos4) => {
  for (let i = 0; i <= ultimosAtendidos4?.length - 1; i++) {
    lblConsultorios[i].innerText = `Consultorio: ${ultimosAtendidos4[i].consultorio}`;
    lblPacientes[i].innerText = `Paciente: ${ultimosAtendidos4[i].nombre}`;
  }
};

const playSound = () => {
  if (CheckSound.checked) {
    audio.play().catch(function (error) {
      if (CheckSound.checked) {
        CheckSound.checked = false;
      }
    });
  }
};
CheckSound.addEventListener("change", playSound);
