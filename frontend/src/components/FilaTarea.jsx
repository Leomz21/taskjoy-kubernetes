import { fechaLegible, estaVencida } from '../constantes.js'
import FormularioTarea from './FormularioTarea.jsx'

export default function FilaTarea({
  tarea,
  editando,
  categoriasExistentes,
  onAlternarEstado,
  onIniciarEdicion,
  onCancelarEdicion,
  onGuardar,
  onEliminar
}) {
  const completada = tarea.estado === 'Completada'
  const vencida = estaVencida(tarea)

  if (editando) {
    return (
      <li className="tarea tarea--editando">
        <FormularioTarea
          valorInicial={tarea}
          categoriasExistentes={categoriasExistentes}
          textoBoton="Guardar cambios"
          onGuardar={onGuardar}
          onCancelar={onCancelarEdicion}
          compacto
        />
      </li>
    )
  }

  return (
    <li className={`tarea ${completada ? 'tarea--lista' : ''}`}>
      <button
        className="casilla"
        onClick={onAlternarEstado}
        aria-label={completada ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {completada && (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="tarea__cuerpo">
        <span className="tarea__titulo">{tarea.titulo}</span>

        <div className="tarea__meta">
          {tarea.categoria && <span className="etiqueta">{tarea.categoria}</span>}

          {tarea.fechaLimite && (
            <span className={`fecha ${vencida ? 'fecha--vencida' : ''}`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {fechaLegible(tarea.fechaLimite)}
              {vencida && ' · vencida'}
            </span>
          )}
        </div>
      </div>

      <span className={`prioridad prioridad--${tarea.prioridad.toLowerCase()}`}>
        {tarea.prioridad}
      </span>

      <div className="acciones">
        <button className="icono" onClick={onIniciarEdicion} aria-label={`Editar ${tarea.titulo}`} title="Editar">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M11.5 2.5a1.6 1.6 0 0 1 2.2 2.2L6 12.4l-3 .8.8-3z"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="icono icono--peligro" onClick={onEliminar} aria-label={`Eliminar ${tarea.titulo}`} title="Eliminar">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </li>
  )
}
