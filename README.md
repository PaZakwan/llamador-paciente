# LLamador-paciente

Sistema para llamar personas en la sala de espera desde los consultorios.

Ejemplo: https://llamador-paciente.onrender.com/

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/PaZakwan/llamador-paciente

# Go into the repository
$ cd llamador-paciente

# Install dependencies
$ npm install

# Run the app
$ npm start
```

## Instalarlo como Servicio de Windows

Necesitaras [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/download/) (ya viene con [npm](http://npmjs.com)) y [node-windows](https://www.npmjs.com/package/node-windows) instalado global.
command line:

```bash
# Clone this repository
$ git clone https://github.com/PaZakwan/llamador-paciente

# Go into the repository
$ cd llamador-paciente

# Install dependencies
$ npm install

# Install node-windows
$ npm install -g node-windows

# link node-windows
$ npm link node-windows

# Create Service
$ node win_service.js
```

### Hecho con

- Nodejs
  - Express.
  - Socket.io.
- HTML
- Javascript
  - jQuery.
- CSS
  - Boostrap 4.
