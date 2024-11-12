// Comando para establecer la conexión
import {io} from "/socket.io/socket.io.esm.min.js";
const audio = new Audio("audio/new-llamado.mp3");

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has("area")) {
  window.location = "index.html";
  alert("El area es necesaria.");
}
const area = searchParams.get("area")?.trim().toLowerCase();

const socket = io("/llamador", {
  query: {
    area,
  },
});

let lblBoxs = [
  document.getElementById("lblBox1"),
  document.getElementById("lblBox2"),
  document.getElementById("lblBox3"),
  document.getElementById("lblBox4"),
];
let lblLlamados = [
  document.getElementById("lblLlamado1"),
  document.getElementById("lblLlamado2"),
  document.getElementById("lblLlamado3"),
  document.getElementById("lblLlamado4"),
];
let CheckSound = document.getElementById("CheckSound");

socket.emit("getUltimosLlamados", null, (resp) => {
  // console.log(resp);
});

socket.on("ultimosLlamados", (data) => {
  if (data?.ultimosLlamados?.length > 0) {
    playSound();
  }
  actualizaHTML(data?.ultimosLlamados);
});

const actualizaHTML = (ultimosLlamados) => {
  for (let i = 0; i <= lblBoxs.length - 1; i++) {
    if (ultimosLlamados[i]) {
      lblBoxs[i].innerText = `Consultorio: ${ultimosLlamados[i].box}`;
      lblLlamados[i].innerText = `Paciente: ${ultimosLlamados[i].nombre}`;
    } else {
      lblBoxs[i].innerText = "Espere...";
      lblLlamados[i].innerText = "";
    }
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
