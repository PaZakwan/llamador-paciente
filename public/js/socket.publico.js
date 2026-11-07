import {obtenerConfig} from "./get-config.js";
const urlAudio = new URL("./../audio/new-llamado.mp3", import.meta.url).href;
const audioLlamado = new Audio(urlAudio);

const searchParams = new URLSearchParams(window.location.search);
if (!searchParams.has("area")) {
  window.location = "./index.html";
  alert("El area es necesaria.");
}
const area = searchParams.get("area")?.trim().toLowerCase();

if (!area) {
  window.location = "./index.html";
  alert("El area es necesaria.");
}

document.getElementById("area").innerText = area;

const config = await obtenerConfig();

const socket = io("/llamador", {
  path: config.io_path,
  query: {
    area,
  },
  autoConnect: true,
  reconnectionAttempts: 5,
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
    // Reset Audio before play again (now can spam playSound)
    audioLlamado.pause();
    audioLlamado.currentTime = 0;

    audioLlamado.play().catch(function (error) {
      if (CheckSound.checked) {
        CheckSound.checked = false;
      }
    });
  }
};

setTimeout(() => {
  if (!CheckSound.checked) {
    alert("No esta activado el Sonido del llamador.");
  }
}, 2000);
CheckSound.addEventListener("change", playSound);
