// URL base de la API. Viene de env.js, que el contenedor genera al arrancar.
export const API_URL = (window.__API_URL__ || "http://localhost:3000").replace(/\/$/, "");

const RUTA = "/api/tareas";

async function pedir(path, options = {}) {
  const respuesta = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }

  if (respuesta.status === 204) return null;

  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

function normalizarLista(dato) {
  if (Array.isArray(dato)) return dato;
  if (Array.isArray(dato?.tareas)) return dato.tareas;
  if (Array.isArray(dato?.data)) return dato.data;
  return [];
}

// Rellena los campos que el servidor todavía podría no estar enviando,
// para que la interfaz nunca se rompa por un campo ausente.
function normalizarTarea(tarea) {
  return {
    ...tarea,
    titulo: tarea.titulo ?? "",
    estado: tarea.estado ?? "Pendiente",
    prioridad: tarea.prioridad ?? "Media",
    categoria: tarea.categoria ?? "",
    fechaLimite: tarea.fechaLimite ?? ""
  };
}

export function idDe(tarea) {
  return tarea._id ?? tarea.id;
}

export function tareaVacia() {
  return { titulo: "", estado: "Pendiente", prioridad: "Media", categoria: "", fechaLimite: "" };
}

export async function listarTareas() {
  return normalizarLista(await pedir(RUTA)).map(normalizarTarea);
}

export async function crearTarea(datos) {
  return pedir(RUTA, {
    method: "POST",
    body: JSON.stringify({ ...tareaVacia(), ...datos })
  });
}

export async function editarTarea(id, cambios) {
  return pedir(`${RUTA}/${id}`, {
    method: "PUT",
    body: JSON.stringify(cambios)
  });
}

export async function eliminarTarea(id) {
  return pedir(`${RUTA}/${id}`, { method: "DELETE" });
}
