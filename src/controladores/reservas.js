const { salasPermitidas, turnosPermitidos } = require("../middleware/reservas");

const { leerCriterios } = require("../servicios/criterios-reservas");

function crearControladorReservas(servicio) {
  async function listarReservas(req, res) {
    const criterios = leerCriterios(req.query);
    const resultado = await servicio.buscar(criterios);

    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas: resultado.datos,
      criterios,
      pagina: resultado.pagina,
      limite: resultado.limite,
      total: resultado.total,
      paginas: resultado.paginas,
    });
  }

  async function consultarApi(req, res) {
    const criterios = leerCriterios(req.query);
    const resultado = await servicio.buscar(criterios);

    res.json(resultado);
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
      turnosPermitidos,
      errores: [],
      datos: {},
    });
  }

  async function mostrarDetalle(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    res.render("reservas/detalle", {
      titulo: `Reserva #${reserva.id}`,
      reserva,
    });
  }

  async function crearReserva(req, res) {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  }
  async function mostrarEdicion(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva que querés editar no existe.",
      });
    }

    res.render("reservas/editar", {
      titulo: "Editar reserva",
      error: null,
      id: reserva.id,
      valores: {
        estudiante: reserva.estudiante,
        email: reserva.email,
        sala: reserva.sala,
        fecha: reserva.fecha,
        turno: reserva.turno,
        personas: String(reserva.personas),
        estado: reserva.estado,
      },
      salasPermitidas,
      turnosPermitidos,
    });
  }
  async function guardarEdicion(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    const datos = req.body ?? {};

    const valores = {
      estudiante: typeof datos.estudiante === "string" ? datos.estudiante : "",
      email: typeof datos.email === "string" ? datos.email : "",
      sala: typeof datos.sala === "string" ? datos.sala : "",
      fecha: typeof datos.fecha === "string" ? datos.fecha : "",
      turno: typeof datos.turno === "string" ? datos.turno : "",
      personas: typeof datos.personas === "string" ? datos.personas : "",
      estado: typeof datos.estado === "string" ? datos.estado : "",
    };

    const permitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
      "estado",
    ];

    const hayCamposExtra = Object.keys(datos).some(
      (campo) => !permitidos.includes(campo),
    );

    const personas =
      valores.personas.trim() === "" ? NaN : Number(valores.personas);

    if (
      hayCamposExtra ||
      !valores.estudiante.trim() ||
      !valores.email.trim() ||
      !valores.email.includes("@") ||
      !salasPermitidas.includes(valores.sala) ||
      !valores.fecha.trim() ||
      !turnosPermitidos.includes(valores.turno) ||
      !Number.isFinite(personas) ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6 ||
      !["pendiente", "confirmada"].includes(valores.estado)
    ) {
      return res.status(400).render("reservas/editar", {
        titulo: "Editar reserva",
        error: "Revisá los datos ingresados en el formulario.",
        id: reserva.id,
        valores,
        salasPermitidas,
        turnosPermitidos,
      });
    }

    res.locals.formularioEdicion = {
      id: reserva.id,
      valores,
    };

    const reemplazo = {
      estudiante: valores.estudiante.trim(),
      email: valores.email.trim(),
      sala: valores.sala,
      fecha: valores.fecha.trim(),
      turno: valores.turno,
      personas,
      estado: valores.estado,
    };

    const actualizada = await servicio.reemplazar(reserva.id, reemplazo);

    if (!actualizada) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    res.redirect(303, `/reservas/${actualizada.id}`);
  }

  async function mostrarCambioParcial(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    res.render("reservas/estado", {
      titulo: "Cambiar estado de reserva",
      error: null,
      id: reserva.id,
      valores: { estado: reserva.estado },
    });
  }

  async function guardarCambioParcial(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    const datos = req.body ?? {};

    const valores = {
      estado: typeof datos.estado === "string" ? datos.estado : "",
    };

    const estadoValido = ["pendiente", "confirmada"].includes(valores.estado);

    if (Object.keys(datos).length !== 1 || !estadoValido) {
      return res.status(400).render("reservas/estado", {
        titulo: "Cambiar estado de reserva",
        error: "Seleccioná únicamente un estado válido.",
        id: reserva.id,
        valores,
      });
    }

    res.locals.formularioParcial = {
      id: reserva.id,
      valores,
    };

    const cambios = {
      estado: valores.estado,
    };

    const actualizada = await servicio.actualizar(reserva.id, cambios);

    if (!actualizada) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }

    res.redirect(303, `/reservas/${actualizada.id}`);
  }

  async function mostrarConfirmacionEliminacion(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    res.render("reservas/eliminar", {
      titulo: "Eliminar reserva",
      reserva,
    });
  }

  async function eliminarReserva(req, res) {
    const eliminada = await servicio.eliminar(req.params.id);

    if (!eliminada) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva solicitada no existe.",
      });
    }

    res.redirect(303, "/reservas");
  }

  async function listarApi(req, res) {
    const parametrosPermitidos = ["sala", "orden", "pagina", "limite"];
    if (
      Object.keys(req.query).some(
        (parametro) => !parametrosPermitidos.includes(parametro),
      )
    ) {
      return res.status(400).json({
        error: "La consulta contiene parámetros no permitidos.",
      });
    }

    const sala = req.query.sala;
    const orden = req.query.orden;
    const paginaTexto = req.query.pagina;
    const limiteTexto = req.query.limite;

    if (sala !== undefined && (typeof sala !== "string" || !sala.trim())) {
      return res.status(400).json({
        error: "El filtro de sala no es válido.",
      });
    }

    if (
      orden !== undefined &&
      (typeof orden !== "string" ||
        !["estudiante", "personas-asc", "personas-desc"].includes(orden))
    ) {
      return res.status(400).json({
        error: "El orden indicado no es válido.",
      });
    }

    if (
      paginaTexto !== undefined &&
      (typeof paginaTexto !== "string" || !paginaTexto.trim())
    ) {
      return res.status(400).json({
        error: "La página indicada no es válida.",
      });
    }

    if (
      limiteTexto !== undefined &&
      (typeof limiteTexto !== "string" || !limiteTexto.trim())
    ) {
      return res.status(400).json({
        error: "El límite indicado no es válido.",
      });
    }

    const pagina = paginaTexto === undefined ? 1 : Number(paginaTexto);
    const limite = limiteTexto === undefined ? 2 : Number(limiteTexto);

    if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
      return res.status(400).json({
        error: "La página debe ser un entero entre 1 y 1000.",
      });
    }

    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      return res.status(400).json({
        error: "El límite debe ser un entero entre 1 y 20.",
      });
    }

    const resultado = await servicio.consultar(sala, orden, pagina, limite);

    res.json(resultado);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicio.buscarPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: "La reserva solicitada no existe.",
      });
    }

    res.json(reserva);
  }

  async function crearApi(req, res) {
    const reserva = await servicio.crear(req.reservaValidada);

    res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
  }

  async function reemplazarApi(req, res) {
    const reserva = await servicio.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );

    if (!reserva) {
      return res.status(404).json({
        error: "La reserva solicitada no existe.",
      });
    }

    res.status(200).json(reserva);
  }

  async function actualizarApi(req, res) {
    const reserva = await servicio.actualizar(
      req.params.id,
      req.cambiosValidos,
    );

    if (!reserva) {
      return res.status(404).json({
        error: "La reserva solicitada no existe.",
      });
    }

    res.status(200).json(reserva);
  }

  async function eliminarApi(req, res) {
    const eliminada = await servicio.eliminar(req.params.id);

    if (!eliminada) {
      return res.status(404).json({
        error: "La reserva solicitada no existe.",
      });
    }

    res.status(204).send();
  }

  return {
    listarReservas,
    consultarApi,
    mostrarFormulario,
    mostrarDetalle,
    crearReserva,
    mostrarEdicion,
    guardarEdicion,
    mostrarCambioParcial,
    guardarCambioParcial,
    mostrarConfirmacionEliminacion,
    eliminarReserva,
    listarApi,
    obtenerApi,
    crearApi,
    reemplazarApi,
    actualizarApi,
    eliminarApi,
  };
}

module.exports = {
  crearControladorReservas,
};
