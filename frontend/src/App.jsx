import { useEffect, useMemo, useState } from 'react'
import {
  idDe,
  tareaVacia,
  listarTareas,
  crearTarea,
  editarTarea,
  eliminarTarea
} from './api.js'
import { NOMBRE_APP, PRIORIDADES, estaVencida } from './constantes.js'
import FormularioTarea from './components/FormularioTarea.jsx'
import Filtros from './components/Filtros.jsx'
import FilaTarea from './components/FilaTarea.jsx'

const FILTROS_INICIALES = {
  vista: 'todas',
  busqueda: '',
  prioridad: 'todas',
  categoria: 'todas',
  orden: 'fecha'
}

export default function App() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  async function recargar() {
    setError(null)
    try {
      setTareas(await listarTareas())
    } catch {
      setError('No pudimos cargar tus tareas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { recargar() }, [])

  async function ejecutar(accion, mensajeError) {
    try {
      await accion()
      await recargar()
      return true
    } catch {
      setError(mensajeError)
      return false
    }
  }

  const agregar = datos =>
    ejecutar(() => crearTarea(datos), 'No pudimos guardar la tarea.')

  const guardarCambios = async datos => {
    const ok = await ejecutar(
      () => editarTarea(idDe(datos), datos),
      'No pudimos guardar los cambios.'
    )
    if (ok) setEditandoId(null)
  }

  const alternarEstado = tarea =>
    ejecutar(
      () => editarTarea(idDe(tarea), {
        ...tarea,
        estado: tarea.estado === 'Completada' ? 'Pendiente' : 'Completada'
      }),
      'No pudimos actualizar la tarea.'
    )

  const borrar = tarea =>
    ejecutar(() => eliminarTarea(idDe(tarea)), 'No pudimos eliminar la tarea.')

  const categorias = useMemo(
    () => [...new Set(tareas.map(t => t.categoria).filter(Boolean))].sort(),
    [tareas]
  )

  const conteos = useMemo(() => ({
    todas: tareas.length,
    pendientes: tareas.filter(t => t.estado !== 'Completada').length,
    completadas: tareas.filter(t => t.estado === 'Completada').length,
    vencidas: tareas.filter(estaVencida).length
  }), [tareas])

  const visibles = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase()

    const filtradas = tareas.filter(t => {
      if (filtros.vista === 'pendientes' && t.estado === 'Completada') return false
      if (filtros.vista === 'completadas' && t.estado !== 'Completada') return false
      if (filtros.vista === 'vencidas' && !estaVencida(t)) return false
      if (filtros.prioridad !== 'todas' && t.prioridad !== filtros.prioridad) return false
      if (filtros.categoria !== 'todas' && t.categoria !== filtros.categoria) return false
      if (texto && !`${t.titulo} ${t.categoria}`.toLowerCase().includes(texto)) return false
      return true
    })

    const porPrioridad = t => PRIORIDADES.indexOf(t.prioridad)

    return filtradas.sort((a, b) => {
      // Las completadas siempre bajan al final de la lista.
      if ((a.estado === 'Completada') !== (b.estado === 'Completada')) {
        return a.estado === 'Completada' ? 1 : -1
      }
      if (filtros.orden === 'prioridad') return porPrioridad(a) - porPrioridad(b)
      if (filtros.orden === 'titulo') return a.titulo.localeCompare(b.titulo, 'es')
      // Por fecha: las que no tienen fecha límite van al final.
      if (!a.fechaLimite) return b.fechaLimite ? 1 : 0
      if (!b.fechaLimite) return -1
      return a.fechaLimite.localeCompare(b.fechaLimite)
    })
  }, [tareas, filtros])

  const hayFiltrosActivos =
    filtros.vista !== 'todas' ||
    filtros.busqueda !== '' ||
    filtros.prioridad !== 'todas' ||
    filtros.categoria !== 'todas'

  return (
    <div className="pagina">
      <header className="cabecera">
        <div className="marca">
          <span className="marca__simbolo" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 12.5 10 17.5 19 6.5" fill="none" stroke="currentColor"
                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="marca__nombre">{NOMBRE_APP}</span>
        </div>

        <p className="cabecera__resumen">
          {conteos.pendientes === 0 && !cargando && !error
            ? 'No tienes tareas pendientes.'
            : `Tienes ${conteos.pendientes} tarea${conteos.pendientes === 1 ? '' : 's'} por hacer`}
          {conteos.vencidas > 0 && (
            <span className="cabecera__alerta">
              {conteos.vencidas} vencida{conteos.vencidas === 1 ? '' : 's'}
            </span>
          )}
        </p>
      </header>

      <FormularioTarea
        key={tareas.length}
        valorInicial={tareaVacia()}
        categoriasExistentes={categorias}
        textoBoton="Agregar"
        onGuardar={agregar}
      />

      {error && (
        <div className="aviso" role="alert">
          <span>{error}</span>
          <button className="boton boton--fantasma" onClick={recargar}>Reintentar</button>
        </div>
      )}

      <Filtros
        filtros={filtros}
        setFiltros={setFiltros}
        categorias={categorias}
        conteos={conteos}
      />

      <section className="lista">
        {cargando && <p className="vacio">Cargando…</p>}

        {!cargando && !error && tareas.length === 0 && (
          <div className="vacio vacio--ilustrado">
            <p className="vacio__titulo">Todo despejado</p>
            <p>Agrega tu primera tarea con el campo de arriba.</p>
          </div>
        )}

        {!cargando && !error && tareas.length > 0 && visibles.length === 0 && (
          <div className="vacio vacio--ilustrado">
            <p className="vacio__titulo">Sin resultados</p>
            <p>Ninguna tarea coincide con los filtros seleccionados.</p>
            {hayFiltrosActivos && (
              <button className="boton boton--fantasma" onClick={() => setFiltros(FILTROS_INICIALES)}>
                Quitar filtros
              </button>
            )}
          </div>
        )}

        <ul>
          {visibles.map(tarea => {
            const id = idDe(tarea)
            return (
              <FilaTarea
                key={id}
                tarea={tarea}
                editando={editandoId === id}
                categoriasExistentes={categorias}
                onAlternarEstado={() => alternarEstado(tarea)}
                onIniciarEdicion={() => setEditandoId(id)}
                onCancelarEdicion={() => setEditandoId(null)}
                onGuardar={datos => guardarCambios({ ...tarea, ...datos })}
                onEliminar={() => borrar(tarea)}
              />
            )
          })}
        </ul>
      </section>
    </div>
  )
}
