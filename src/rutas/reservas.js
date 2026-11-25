const express = require("express");

const {
  prepararAreaReservas,
  validarReserva,
} = require("../middleware/reservas");

const { crearControladorReservas } = require("../controladores/reservas");

function crearReservasRouter(servicio) {
  const router = express.Router();

  const controlador = crearControladorReservas(servicio);

  router.use(prepararAreaReservas);

  router.get("/", controlador.listarReservas);

  router.get("/nueva", controlador.mostrarFormulario);

  router.get("/:id/editar", controlador.mostrarEdicion);

  router.post("/:id/editar", controlador.guardarEdicion);

  router.get("/:id/estado", controlador.mostrarCambioParcial);

  router.post("/:id/estado", controlador.guardarCambioParcial);

  router.get("/:id/eliminar", controlador.mostrarConfirmacionEliminacion);

  router.post("/:id/eliminar", controlador.eliminarReserva);

  router.get("/:id", controlador.mostrarDetalle);

  router.post("/", validarReserva, controlador.crearReserva);

  return router;
}

module.exports = crearReservasRouter;
