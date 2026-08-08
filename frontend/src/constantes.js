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

// "2026-08-15" -> "15/08/2026"
export function isoATexto(iso) {
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// "15/08/2026" -> "2026-08-15", o null si la fecha no existe (ej. 31/02/2026)
export function textoAIso(texto) {
  const partes = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!partes) return null;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const anio = Number(partes[3]);

  const fecha = new Date(anio, mes - 1, dia);
  const existe =
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia;

  if (!existe) return null;
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// Va colocando las barras mientras se escribe: "1508" -> "15/08"
export function formatearFechaTexto(entrada) {
  const digitos = entrada.replace(/\D/g, "").slice(0, 8);
  const partes = [];
  if (digitos.length > 0) partes.push(digitos.slice(0, 2));
  if (digitos.length > 2) partes.push(digitos.slice(2, 4));
  if (digitos.length > 4) partes.push(digitos.slice(4, 8));
  return partes.join("/");
}

export function estaVencida(tarea) {
  return Boolean(
    tarea.fechaLimite &&
    tarea.estado !== "Completada" &&
    tarea.fechaLimite < hoyISO()
  );
}
