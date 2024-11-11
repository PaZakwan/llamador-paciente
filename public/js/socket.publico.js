// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const socket = io("/llamador");
const audio = new Audio("audio/new-llamado.mp3");

let lblLlamados = [
  document.getElementById("lblLlamado1"),
  document.getElementById("lblLlamado2"),
  document.getElementById("lblLlamado3"),
  document.getElementById("lblLlamado4"),
];
let lblBoxs = [
  document.getElementById("lblBox1"),
  document.getElementById("lblBox2"),
  document.getElementById("lblBox3"),
  document.getElementById("lblBox4"),
];
let CheckSound = document.getElementById("CheckSound");

socket.on("estadoActual", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data?.ultimosLlamados);
});

socket.on("ultimosLlamados", (data) => {
  // console.log(data);
  playSound();
  actualizaHTML(data?.ultimosLlamados);
});

const actualizaHTML = (ultimosLlamados) => {
  for (let i = 0; i <= ultimosLlamados?.length - 1; i++) {
    lblLlamados[i].innerText = `Paciente: ${ultimosLlamados[i].nombre}`;
    lblBoxs[i].innerText = `Consultorio: ${ultimosLlamados[i].box}`;
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
