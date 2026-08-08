# TaskJoy — Sistema de Gestión de Tareas

Aplicación web para gestionar tareas (crear, listar, editar y eliminar), desplegada
con **Docker** y **Kubernetes** en dos máquinas distintas que se comunican a través
de una red privada **Tailscale**.

## Arquitectura

```
        Máquina A                                  Máquina B
┌──────────────────────────┐              ┌──────────────────────────┐
│  Docker Desktop + K8s    │              │  Docker Desktop + K8s    │
│                          │              │                          │
│  Service NodePort :30081 │◄──Tailscale──┤  Frontend (1 réplica)    │
│           │              │   IP privada │  Service NodePort :30080 │
│  Backend  (2 réplicas)   │              │                          │
│           │              │              │                          │
│  MongoDB  (1 réplica)    │              │                          │
│  Service ClusterIP       │              │                          │
└──────────────────────────┘              └──────────────────────────┘
```

El navegador de la Máquina B consulta la API de la Máquina A usando su IP de
Tailscale y el NodePort del backend. No se usa `localhost`, porque el backend no
corre en la misma máquina que el frontend.

## Estructura del repositorio

Este repositorio usa una rama por componente:

| Rama       | Contenido                                          |
|------------|----------------------------------------------------|
| `main`     | Documentación general del proyecto                 |
| `frontend` | Aplicación React, Dockerfile y manifiestos K8s     |
| `backend`  | API Express, MongoDB, Dockerfile y manifiestos K8s |

## Tecnologías

| Componente | Tecnología                    |
|------------|-------------------------------|
| Frontend   | React 18 + Vite, servido con Nginx |
| Backend    | Node.js + Express             |
| Base de datos | MongoDB                    |
| Orquestación | Kubernetes (Docker Desktop) |
| Red privada | Tailscale                    |

## Funcionalidades

- Crear, listar, editar y eliminar tareas
- Marcar tareas como completadas o pendientes
- Prioridad (Alta / Media / Baja), categoría y fecha límite
- Búsqueda por texto y filtros por estado, prioridad y categoría
- Ordenamiento por fecha límite, prioridad o nombre
- Detección automática de tareas vencidas

## Contrato de la API

Ambos componentes se comunican mediante esta interfaz.

### Entidad Tarea

| Campo         | Tipo   | Obligatorio | Valores permitidos                | Por defecto |
|---------------|--------|-------------|-----------------------------------|-------------|
| `titulo`      | String | Sí          | Texto libre                       | —           |
| `estado`      | String | Sí          | `Pendiente` \| `Completada`       | `Pendiente` |
| `prioridad`   | String | No          | `Alta` \| `Media` \| `Baja`       | `Media`     |
| `categoria`   | String | No          | Texto libre o `""`                | `""`        |
| `fechaLimite` | String | No          | Formato `YYYY-MM-DD` o `""`       | `""`        |

```json
{
  "_id": "66b3f1a2c4e5d6f7a8b9c0d1",
  "titulo": "Enviar informe mensual",
  "estado": "Pendiente",
  "prioridad": "Alta",
  "categoria": "Trabajo",
  "fechaLimite": "2026-08-15"
}
```

### Endpoints

| Método   | Ruta              | Cuerpo               | Respuesta            |
|----------|-------------------|----------------------|----------------------|
| `GET`    | `/api/tareas`     | —                    | Array de tareas      |
| `POST`   | `/api/tareas`     | Objeto tarea         | Tarea creada         |
| `PUT`    | `/api/tareas/:id` | Objeto tarea         | Tarea actualizada    |
| `DELETE` | `/api/tareas/:id` | —                    | `204` sin contenido  |

### Puertos

| Elemento                    | Puerto  |
|-----------------------------|---------|
| Backend (interno)           | `3000`  |
| Backend NodePort (Máquina A)| `30081` |
| Frontend NodePort (Máquina B)| `30080` |
| MongoDB (ClusterIP)         | `27017` |

## Puesta en marcha

Cada rama incluye sus propias instrucciones de despliegue. En términos generales:

1. Ambas máquinas instalan Docker Desktop con Kubernetes habilitado.
2. Ambas máquinas instalan Tailscale y se unen a la misma tailnet.
3. La Máquina A despliega MongoDB y el backend, y comparte su IP de Tailscale.
4. La Máquina B coloca esa IP en su ConfigMap y despliega el frontend.
