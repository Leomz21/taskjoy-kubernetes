import { PRIORIDADES, ORDENES } from '../constantes.js'

const VISTAS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'pendientes', etiqueta: 'Pendientes' },
  { valor: 'completadas', etiqueta: 'Completadas' },
  { valor: 'vencidas', etiqueta: 'Vencidas' }
]

export default function Filtros({ filtros, setFiltros, categorias, conteos }) {
  function cambiar(campo, valor) {
    setFiltros(previo => ({ ...previo, [campo]: valor }))
  }

  const hayFiltrosActivos =
    filtros.busqueda || filtros.prioridad !== 'todas' || filtros.categoria !== 'todas'

  return (
    <div className="filtros">
      <div className="filtros__vistas" role="tablist" aria-label="Filtrar por estado">
        {VISTAS.map(v => (
          <button
            key={v.valor}
            role="tab"
            aria-selected={filtros.vista === v.valor}
            className={`pestana ${filtros.vista === v.valor ? 'pestana--activa' : ''}`}
            onClick={() => cambiar('vista', v.valor)}
          >
            {v.etiqueta}
            <span className="pestana__conteo">{conteos[v.valor] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="filtros__linea">
        <div className="buscador">
          <svg className="buscador__icono" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="buscador__campo"
            type="search"
            value={filtros.busqueda}
            onChange={e => cambiar('busqueda', e.target.value)}
            placeholder="Buscar tareas"
            aria-label="Buscar tareas"
          />
        </div>

        <label className="control control--linea">
          <span className="control__etiqueta">Prioridad</span>
          <select
            className="campo campo--mini"
            value={filtros.prioridad}
            onChange={e => cambiar('prioridad', e.target.value)}
          >
            <option value="todas">Todas</option>
            {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <label className="control control--linea">
          <span className="control__etiqueta">Categoría</span>
          <select
            className="campo campo--mini"
            value={filtros.categoria}
            onChange={e => cambiar('categoria', e.target.value)}
          >
            <option value="todas">Todas</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="control control--linea">
          <span className="control__etiqueta">Ordenar por</span>
          <select
            className="campo campo--mini"
            value={filtros.orden}
            onChange={e => cambiar('orden', e.target.value)}
          >
            {ORDENES.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
        </label>

        {hayFiltrosActivos && (
          <button
            className="boton boton--fantasma"
            onClick={() => setFiltros(p => ({ ...p, busqueda: '', prioridad: 'todas', categoria: 'todas' }))}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
