import mongoose from "mongoose";

const schemaOptions = {
  toObject: {
    getters: true,
  },
  toJSON: {
    getters: true,
  },
};

const LlamadorSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      default: Date.now,
    },
    area: {
      type: String,
      trim: true,
      required: [true, "El Area a gestionar es necesario."],
    },

    ultimosLlamados: {
      type: [
        {
          nombre: {
            type: String,
            trim: true,
          },
          box: {
            type: String,
            trim: true,
          },
        },
      ],
      _id: false,
      default: void 0,
    },
    personasEsperan: {
      type: [
        {
          nombre: {
            type: String,
            trim: true,
          },
        },
      ],
      _id: false,
      default: void 0,
    },
  },
  schemaOptions
);

// LlamadorSchema.virtual("nombreC").get(function () {
//   try {
//     return `${this.nombre}${this.descripcion ? `: ${this.descripcion}` : ""}`;
//   } catch (error) {
//     return "ERROR nombre y descripcion";
//   }
// });

export const Llamador = mongoose.model("Llamador", LlamadorSchema, "Llamadores");
