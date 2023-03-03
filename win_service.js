var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "LLamador Pacientes",
  description: "Sistema para llamar personas en la sala de espera desde los consultorios.",
  script: "C:\\Users\\jpvillar\\Desktop\\Programas\\llamador-paciente\\server\\server.js",
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  //, workingDirectory: '...'
  //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
  svc.start();
});

svc.install();
