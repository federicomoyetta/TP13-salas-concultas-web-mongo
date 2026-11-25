const { salasPermitidas, turnosPermitidos } = require("./reservas");

function manejarErrores(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error("Error en la solicitud:", err.message);

  const esApi = req.originalUrl.startsWith("/api/");

  const esJsonMalFormado =
    err instanceof SyntaxError && err.status === 400 && "body" in err;

  const esErrorDeValidacion = err.name === "ValidationError";

  const esErrorDeEntrada =
    err.codigo === "ID_INVALIDO" ||
    err.codigo === "FILTRO_INVALIDO" ||
    err.codigo === "ENTRADA_INVALIDA" ||
    esJsonMalFormado ||
    esErrorDeValidacion;

  if (esApi) {
    if (esErrorDeEntrada) {
      return res.status(400).json({
        error: "Los datos enviados no son válidos.",
      });
    }

    return res.status(500).json({
      error: "Ocurrió un error interno del servidor.",
    });
  }

  if (
    esErrorDeValidacion &&
    req.method === "POST" &&
    res.locals.formularioParcial
  ) {
    return res.status(400).render("reservas/estado", {
      titulo: "Cambiar estado de reserva",
      error: "Revisá el estado seleccionado.",
      id: res.locals.formularioParcial.id,
      valores: res.locals.formularioParcial.valores,
    });
  }

  if (
    esErrorDeValidacion &&
    req.method === "POST" &&
    res.locals.formularioEdicion
  ) {
    return res.status(400).render("reservas/editar", {
      titulo: "Editar reserva",
      error: "Revisá los datos ingresados en el formulario.",
      id: res.locals.formularioEdicion.id,
      valores: res.locals.formularioEdicion.valores,
      salasPermitidas,
      turnosPermitidos,
    });
  }

  if (esErrorDeEntrada) {
    return res.status(400).render("no-encontrado", {
      titulo: "400 - Solicitud inválida",
      mensaje: "Los datos enviados no son válidos.",
    });
  }

  return res.status(500).render("no-encontrado", {
    titulo: "500 - Error del servidor",
    mensaje: "Ocurrió un error interno del servidor.",
  });
}

module.exports = { manejarErrores };
