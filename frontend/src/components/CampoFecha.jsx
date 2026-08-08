import { useEffect, useRef, useState } from 'react'
import { isoATexto, textoAIso, formatearFechaTexto } from '../constantes.js'

/**
 * Campo de fecha que se puede escribir a mano (dd/mm/aaaa) o elegir en el
 * calendario. Hacia fuera siempre entrega el formato YYYY-MM-DD que espera la API.
 */
export default function CampoFecha({ valor, onChange }) {
  const [texto, setTexto] = useState(isoATexto(valor))
  const [invalido, setInvalido] = useState(false)
  const calendario = useRef(null)

  // Si la fecha cambia desde fuera (por ejemplo al abrir otra tarea),
  // se refleja aquí, pero sin pisar lo que la persona esté escribiendo.
  useEffect(() => {
    if (textoAIso(texto) !== (valor || null)) {
      setTexto(isoATexto(valor))
      setInvalido(false)
    }
  }, [valor])

  function escribir(e) {
    const formateado = formatearFechaTexto(e.target.value)
    setTexto(formateado)

    if (formateado === '') {
      setInvalido(false)
      onChange('')
      return
    }

    const iso = textoAIso(formateado)
    if (iso) {
      setInvalido(false)
      onChange(iso)
    } else {
      // Solo se avisa cuando la fecha ya está completa; mientras se escribe, no.
      setInvalido(formateado.length === 10)
    }
  }

  // Si quedó a medias o no existe, se restaura la última fecha válida.
  function alSalir() {
    if (texto !== '' && !textoAIso(texto)) {
      setTexto(isoATexto(valor))
      setInvalido(false)
    }
  }

  function abrirCalendario() {
    const campo = calendario.current
    if (!campo) return
    if (typeof campo.showPicker === 'function') campo.showPicker()
    else campo.focus()
  }

  return (
    <div className={`fecha-campo ${invalido ? 'fecha-campo--invalido' : ''}`}>
      <input
        className="fecha-campo__texto"
        value={texto}
        onChange={escribir}
        onBlur={alSalir}
        placeholder="dd/mm/aaaa"
        inputMode="numeric"
        aria-label="Fecha límite"
        aria-invalid={invalido}
      />

      <button
        type="button"
        className="fecha-campo__boton"
        onClick={abrirCalendario}
        aria-label="Elegir en el calendario"
        title="Elegir en el calendario"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <input
        ref={calendario}
        type="date"
        className="fecha-campo__calendario"
        value={valor || ''}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
