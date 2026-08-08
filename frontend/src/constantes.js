export const NOMBRE_APP = "TaskJoy";

export const ESTADOS = ["Pendiente", "Completada"];

export const PRIORIDADES = ["Alta", "Media", "Baja"];

export const CATEGORIAS_SUGERIDAS = [
  "Trabajo",
  "Personal",
  "Estudio",
  "Hogar",
  "Compras",
  "Salud"
];

export const ORDENES = [
  { valor: "fecha", etiqueta: "Fecha límite" },
  { valor: "prioridad", etiqueta: "Prioridad" },
  { valor: "titulo", etiqueta: "Nombre" }
];

// Fecha de hoy en formato YYYY-MM-DD usando la zona horaria local.
export function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// "2026-08-14" -> "14 ago"  |  hoy y mañana se muestran con palabra
export function fechaLegible(iso) {
  if (!iso) return "";
  const hoy = hoyISO();
  if (iso === hoy) return "Hoy";

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mes = String(manana.getMonth() + 1).padStart(2, "0");
  const dia = String(manana.getDate()).padStart(2, "0");
  if (iso === `${manana.getFullYear()}-${mes}-${dia}`) return "Mañana";

  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const [anio, m, d] = iso.split("-");
  const etiqueta = `${Number(d)} ${meses[Number(m) - 1]}`;
  return anio === String(new Date().getFullYear()) ? etiqueta : `${etiqueta} ${anio}`;
}

export function estaVencida(tarea) {
  return Boolean(
    tarea.fechaLimite &&
    tarea.estado !== "Completada" &&
    tarea.fechaLimite < hoyISO()
  );
}
