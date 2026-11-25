function leerCriterios(query) {
  const permitidos = ["q", "sala", "orden", "pagina", "limite"];

  for (const campo of Object.keys(query)) {
    if (!permitidos.includes(campo)) {
      const error = new Error("Parámetro no permitido.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }

    if (typeof query[campo] !== "string") {
      const error = new Error("Enviá un solo texto por parámetro.");
      error.codigo = "ENTRADA_INVALIDA";
      throw error;
    }
  }

  const q = (query.q ?? "").trim();
  const sala = (query.sala ?? "").trim();
  const orden = query.orden ?? "estudiante";

  if (q.length > 60 || sala.length > 80) {
    const error = new Error("Criterio demasiado largo.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  if (!["estudiante", "personas-asc", "personas-desc"].includes(orden)) {
    const error = new Error("Orden no permitido.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  const pagina = Number(query.pagina ?? "1");
  const limite = Number(query.limite ?? "2");

  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
    const error = new Error("La página debe ser un entero entre 1 y 1000.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
    const error = new Error("El límite debe ser un entero entre 1 y 20.");
    error.codigo = "ENTRADA_INVALIDA";
    throw error;
  }

  return { q, sala, orden, pagina, limite };
}

module.exports = { leerCriterios };
