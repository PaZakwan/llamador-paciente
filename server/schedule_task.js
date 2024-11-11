const schedule = require("node-schedule");
const _merge = require("lodash/merge");

const FarmaciaIngreso = require("./modulos/farmacia/models/farmacia_ingreso");
const FarmaciaTransferencia = require("./modulos/farmacia/models/farmacia_transferencia");
const InsumoEntrega = require("./modulos/farmacia/models/insumo_entrega");
const FarmaciaDescarte = require("./modulos/farmacia/models/farmacia_descarte");
const FarmaciaSolicitud = require("./modulos/farmacia/models/farmacia_solicitud");
const FarmaciaEstadistica = require("./modulos/farmacia/models/farmacia_estadistica");

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// ############
// DESARROLLAR
// Tarea para resetear data y emitir evento diario.
// ############

const saveFarmaciaEstadistica = function () {
  // guardar stock final, recibido(ingreso/trasnfer), consumo(entrega), pedido (solicitudes)
  // No guardar stock.. el stock calcularlo en base a la diferencia de los demas datos.
  // guardar los datos del mes pasado, por si faltan cargas del actual (ventana de carga 1 seamana)
  // el actual calcularlo en el momento a partir de las diferencias respecto ultimo mes guardado
  try {
    // cada 15seg para testing
    // schedule.scheduleJob("*/15 * * * * *", async (fireDate) => {
    // a los 00 de cada hora de los dias 2 de cada mes guardara los datos para estadistica
    schedule.scheduleJob("0 * 2 * *", async (fireDate) => {
      // console.log("fireDate", fireDate.toUTCString());
      let primerDiaMes = new Date();
      primerDiaMes.setUTCDate(1);
      primerDiaMes.setUTCHours(0, 0, 0, 0);

      let mesAnterior = new Date(primerDiaMes.getTime());
      mesAnterior.setUTCMonth(mesAnterior.getUTCMonth() - 1);

      let mesesAnteriores = new Date(primerDiaMes.getTime());
      mesesAnteriores.setUTCMonth(mesesAnteriores.getUTCMonth() - 2);

      let estadisticaDB = await FarmaciaEstadistica.aggregate().match({fecha: mesAnterior});
      if (estadisticaDB.length === 0) {
        // RECIBIDOS (INGRESOS / TRANSFERENCIAS RECIBIDAS)

        // Recibido Ingresos
        let ingresosDB = await FarmaciaIngreso.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .unwind("$insumos")
          .group({
            _id: {area: "$destino", insumo: "$insumos.insumo"},
            recibido_ingreso: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {$not: ["$insumos.recibido"]},
                      then: 0,
                    },
                  ],
                  default: "$insumos.cantidad",
                },
              },
            },
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // Recibido Transferencias
        let recibidoTransferenciaDB = await FarmaciaTransferencia.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .unwind("$insumos")
          .group({
            _id: {area: "$destino", insumo: "$insumos.insumo"},
            recibido_transferencia: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {$not: ["$insumos.recibido"]},
                      then: 0,
                    },
                  ],
                  default: "$insumos.cantidad",
                },
              },
            },
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // TRANSFERENCIAS (RETIRADAS) / ENTREGAS / DESCARTES (Utilizados)

        // Retiradas Transferencias
        let retiradasTransferenciaDB = await FarmaciaTransferencia.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .unwind("$insumos")
          .group({
            _id: {area: "$origen", insumo: "$insumos.insumo"},
            retirado_transferencia: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {$not: ["$insumos.retirado"]},
                      then: 0,
                    },
                  ],
                  default: "$insumos.cantidad",
                },
              },
            },
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // Entregas
        let entregasDB = await InsumoEntrega.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .group({
            _id: {area: "$origen", insumo: "$insumo"},
            entregados: {$sum: "$cantidad"},
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // Descartes (Utilizados)
        let descartesDB = await FarmaciaDescarte.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .group({
            _id: {area: "$origen", insumo: "$insumo"},
            utilizados: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {$eq: ["$motivo", "Utilizado"]},
                      then: "$cantidad",
                    },
                  ],
                  default: 0,
                },
              },
            },
            descartados: {
              $sum: {
                $switch: {
                  branches: [
                    {
                      case: {$ne: ["$motivo", "Utilizado"]},
                      then: "$cantidad",
                    },
                  ],
                  default: 0,
                },
              },
            },
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // SOLICITUDES
        let solicitudesDB = await FarmaciaSolicitud.aggregate()
          .match({
            // fecha: {$gte: mesAnterior, $lt: primerDiaMes},
            fecha: {$gte: mesesAnteriores, $lt: mesAnterior},
          })
          .unwind("$insumos")
          .group({
            _id: {area: "$origen", insumo: "$insumos.insumo"},
            solicitados: {$sum: "$insumos.cantidad"},
          })
          .addFields({
            area: "$_id.area",
            insumo: "$_id.insumo",
          })
          .project({_id: 0});

        // STOCK ANTERIOR
        let estadisticaAnteriorDB = await FarmaciaEstadistica.find({
          fecha: mesesAnteriores,
        }).exec();
        estadisticaAnteriorDB = estadisticaAnteriorDB.map((element) => ({
          area: element.area,
          insumo: element.insumo,
          stock_anterior: element.stock,
        }));

        // MERGE / join DE area / insumo...
        let merge = _merge(
          [],
          estadisticaAnteriorDB,
          ingresosDB,
          recibidoTransferenciaDB,
          retiradasTransferenciaDB,
          entregasDB,
          descartesDB,
          solicitudesDB
        );
        merge.forEach((element) => {
          element.fecha = new Date(mesAnterior.getTime());
        });
        let mergeSave = await FarmaciaEstadistica.insertMany(merge, {
          ordered: false,
          includeResultMetadata: true,
        });

        // console.log("primerDiaMes", primerDiaMes.toUTCString());
        // console.log("mesAnterior", mesAnterior.toUTCString());
        // console.log("mesesAnteriores", mesesAnteriores.toUTCString());

        // console.log(`ingresosDB: `, ingresosDB);
        // console.log(`recibidoTransferenciaDB: `, recibidoTransferenciaDB);

        // console.log(`retiradasTransferenciaDB: `, retiradasTransferenciaDB);
        // console.log(`entregasDB: `, entregasDB);
        // console.log(`descartesDB: `, descartesDB);

        // console.log(`solicitudesDB: `, solicitudesDB);
        // console.log(`stock_anterior: `, estadisticaAnteriorDB);

        // console.log(`merge: `, merge.length);
        // console.log(`mergeSave: `, mergeSave);

        console.log(`✓ schedule saveFarmaciaEstadistica ${fireDate.toUTCString()}`);
      } else {
        // no hacer nada ya se ejecuto
        // let estadisticasDB = await FarmaciaEstadistica.find().exec();
        // console.log(
        //   `Ya se ejecuto schedule saveFarmaciaEstadistica ${fireDate.toUTCString()}`,
        //   estadisticasDB
        // );
      }
    });
  } catch (error) {
    console.error(`× schedule saveFarmaciaEstadistica: `, error);
  }
};

// FUNCION PARA INICIAR Todas las tareas cronologicas
const scheduleRun = async () => {
  try {
    // saveFarmaciaEstadistica();
    //  gracefully shutdown jobs when a system interrupt occurs.
    process.on("SIGINT", async () => {
      console.log("gracefulShutdown");
      await schedule.gracefulShutdown();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      console.log("gracefulShutdown");
      await schedule.gracefulShutdown();
      process.exit(0);
    });
    process.on("SIGQUIT", async () => {
      console.log("gracefulShutdown");
      await schedule.gracefulShutdown();
      process.exit(0);
    });
    return true;
  } catch (error) {
    console.error(`scheduleRun CATCH => ${error.name}: ${error.message}.`);
    return false;
  }
};

// exports
exports.scheduleRun = scheduleRun;
// exports.saveFarmaciaEstadistica = saveFarmaciaEstadistica;
