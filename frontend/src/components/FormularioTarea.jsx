import { useState } from 'react'
import { PRIORIDADES, CATEGORIAS_SUGERIDAS } from '../constantes.js'

/**
 * Formulario para crear o editar una tarea.
 * Se usa en dos sitios: la barra de creación y la edición dentro de una fila.
 */
export default function FormularioTarea({
  valorInicial,
  categoriasExistentes = [],
  textoBoton = 'Guardar',
  onGuardar,
  onCancelar,
  compacto = false
}) {
  const [datos, setDatos] = useState(valorInicial)

  const sugerencias = [...new Set([...CATEGORIAS_SUGERIDAS, ...categoriasExistentes])]

  function actualizar(campo, valor) {
    setDatos(previo => ({ ...previo, [campo]: valor }))
  }

  function enviar(e) {
    e.preventDefault()
    const titulo = datos.titulo.trim()
    if (!titulo) return
    onGuardar({ ...datos, titulo, categoria: datos.categoria.trim() })
  }

  return (
    <form className={`formulario ${compacto ? 'formulario--compacto' : ''}`} onSubmit={enviar}>
      <input
        className="campo campo--titulo"
        value={datos.titulo}
        onChange={e => actualizar('titulo', e.target.value)}
        placeholder="¿Qué necesitas hacer?"
        aria-label="Título de la tarea"
        autoFocus={compacto}
      />

      <div className="formulario__detalles">
        <label className="control">
          <span className="control__etiqueta">Categoría</span>
          <input
            className="campo campo--mini"
            list="lista-categorias"
            value={datos.categoria}
            onChange={e => actualizar('categoria', e.target.value)}
            placeholder="Sin categoría"
          />
        </label>

        <datalist id="lista-categorias">
          {sugerencias.map(c => <option key={c} value={c} />)}
        </datalist>

        <label className="control">
          <span className="control__etiqueta">Prioridad</span>
          <select
            className="campo campo--mini"
            value={datos.prioridad}
            onChange={e => actualizar('prioridad', e.target.value)}
          >
            {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <label className="control">
          <span className="control__etiqueta">Fecha límite</span>
          <input
            className="campo campo--mini"
            type="date"
            value={datos.fechaLimite}
            onChange={e => actualizar('fechaLimite', e.target.value)}
          />
        </label>

        <div className="formulario__acciones">
          {onCancelar && (
            <button type="button" className="boton boton--fantasma" onClick={onCancelar}>
              Cancelar
            </button>
          )}
          <button type="submit" className="boton boton--solido">{textoBoton}</button>
        </div>
      </div>
    </form>
  )
}
