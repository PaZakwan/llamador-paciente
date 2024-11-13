import {io} from "#MAIN_FOLDER/server.js";
import {LlamadorControl} from "#MAIN_FOLDER/classes/llamador-control.js";

const llamadorControl = new LlamadorControl();

io.of("/llamador").on("connection", (client) => {
  // console.log("#### client ####", client.handshake.address);
  // console.log("client handshake.headers.referer:", client.handshake.headers.referer);
  // console.log("client handshake.query:", client.handshake.query);

  client.join(client.handshake.query.area);

  client.on("getUltimosLlamados", (data, callback) => {
    // actualizar / notificar estado en ultimosLlamados, solamente al que emitio el getUltimosLlamados
    client.emit("ultimosLlamados", {
      ultimosLlamados: llamadorControl.getUltimosLlamados({area: client.handshake.query.area}),
    });
    return;
  });

  client.on("getPersonasEsperan", (data, callback) => {
    // actualizar / notificar estado en personasEsperan, solamente al que emitio el getUltimosLlamados
    client.emit("personasEsperan", {
      personasEsperan: llamadorControl.getPersonasEsperan({area: client.handshake.query.area}),
    });
    return;
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
        area: client.handshake.query.area,
        nombre: data.nombre,
        box: data.box,
      });
      // console.log("personaLlamada: ", personaLlamada);

      // actualizar / notificar cambios en ultimosLlamados, a todo el grupo del "area"
      client.to(client.handshake.query.area).emit("ultimosLlamados", {
        ultimosLlamados: llamadorControl.getUltimosLlamados({area: client.handshake.query.area}),
      });

      return callback(personaLlamada);
    } catch (error) {
      console.error("Error - llamarPersona: ", error);
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

      let agregado = llamadorControl.addPersonaEspera({
        area: client.handshake.query.area,
        nombre: data.nombre,
      });
      // console.log("agregado: ", agregado);

      // actualizar / notificar cambios en personasEsperan, a todo el grupo del "area"
      client.broadcast.to(client.handshake.query.area).emit("personasEsperan", {
        personasEsperan: llamadorControl.getPersonasEsperan({area: client.handshake.query.area}),
      });

      return callback(agregado);
    } catch (error) {
      console.error("Error - addPersonaEspera: ", error);
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

      let siguientePersona = llamadorControl.llamarSiguientePersona({
        area: client.handshake.query.area,
        box: data.box,
      });
      // console.log("siguientePersona: ", siguientePersona);

      // actualizar / notificar cambios en ultimosLlamados, a todo el grupo del "area"
      client.to(client.handshake.query.area).emit("ultimosLlamados", {
        ultimosLlamados: llamadorControl.getUltimosLlamados({area: client.handshake.query.area}),
      });

      return callback(siguientePersona);
    } catch (error) {
      console.error("Error - llamarSiguientePersona: ", error);
      return callback({
        err: true,
        mensaje: `Error - llamarSiguientePersona: ${error}`,
      });
    }
  });
});
