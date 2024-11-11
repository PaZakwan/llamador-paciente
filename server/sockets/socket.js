import {io} from "#MAIN_FOLDER/server.js";
import {LlamadorControl} from "#MAIN_FOLDER/classes/llamador-control.js";

const llamadorControl = new LlamadorControl();

// create Rooms para distintas areas..
// socket.join("some room");
// socket.to("some room").emit("some event");

io.of("/llamador").on("connection", (client) => {
  // console.log("#### client ####", client.handshake.address);
  console.log("client handshake.address:", client.handshake.address);
  console.log("client handshake.headers.referer:", client.handshake.headers.referer);
  // console.log("client handshake:", client.handshake);

  // client.join(client.handshake.address);

  client.emit("estadoActual", {
    // client.to(client.handshake.address).emit("estadoActual", {
    ultimosLlamados: llamadorControl.getUltimosLlamados(),
    personasEsperan: llamadorControl.getPersonasEsperan(),
  });

  client.on("llamarPersona", (data, callback) => {
    try {
      if (!data.box) {
        return callback({
          err: true,
          mensaje: "El Consultorio es necesario.",
        });
      }

      if (!data.nombre) {
        return callback({
          err: true,
          mensaje: "El Nombre de la Persona es necesario.",
        });
      }

      let personaLlamada = llamadorControl.llamarPersona({
        nombre: data.nombre,
        box: data.box,
      });
      // console.log("personaLlamada: ", personaLlamada);

      // actualizar / notificar cambios en ultimosLlamados
      client.broadcast.emit("ultimosLlamados", {
        // client.broadcast.to(client.handshake.address).emit("ultimosLlamados", {
        ultimosLlamados: llamadorControl.getUltimosLlamados(),
      });

      return callback(personaLlamada);
    } catch (error) {
      console.log("Error - llamarPersona: ", error);
      return callback({
        err: true,
        mensaje: `Error - llamarPersona: ${error}`,
      });
    }
  });

  client.on("addPersonaEspera", (data, callback) => {
    try {
      if (!data.nombre) {
        return callback({
          err: true,
          mensaje: "El Nombre de la Persona es necesario.",
        });
      }

      let agregado = llamadorControl.addPersonaEspera(data.nombre);
      // console.log("agregado: ", agregado);

      // actualizar / notificar cambios en personasEsperan
      client.broadcast.emit("personasEsperan", {
        // client.broadcast.to(client.handshake.address).emit("personasEsperan", {
        personasEsperan: llamadorControl.getPersonasEsperan(),
      });

      return callback(agregado);
    } catch (error) {
      console.log("Error - addPersonaEspera: ", error);
      return callback({
        err: true,
        mensaje: `Error - addPersonaEspera: ${error}`,
      });
    }
  });

  client.on("llamarSiguientePersona", (data, callback) => {
    try {
      if (!data.box) {
        return callback({
          err: true,
          mensaje: "El Consultorio es necesario.",
        });
      }

      let siguientePersona = llamadorControl.llamarSiguientePersona(data.box);
      // console.log("siguientePersona: ", siguientePersona);

      // actualizar / notificar cambios en ultimosLlamados
      client.broadcast.emit("ultimosLlamados", {
        // client.broadcast.to(client.handshake.address).emit("ultimosLlamados", {
        ultimosLlamados: llamadorControl.getUltimosLlamados(),
      });

      return callback(siguientePersona);
    } catch (error) {
      console.log("Error - llamarSiguientePersona: ", error);
      return callback({
        err: true,
        mensaje: `Error - llamarSiguientePersona: ${error}`,
      });
    }
  });
});
