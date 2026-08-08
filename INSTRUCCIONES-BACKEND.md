# Instrucciones para el Backend — Máquina A

Guía completa para construir el backend de forma que encaje exactamente con el
frontend que ya está terminado. Si sigues estos pasos, la integración funciona
a la primera.

---

## 1. Crear el proyecto

```bash
mkdir backend
cd backend
npm init -y
npm install express mongoose cors
```

Edita `package.json` y agrega esta línea dentro de `"scripts"`:

```json
"start": "node server.js"
```

---

## 2. Estructura de carpetas

```
backend/
├── server.js
├── modelos/
│   └── Tarea.js
├── rutas/
│   └── tareas.js
├── Dockerfile
├── .dockerignore
└── package.json
```

---

## 3. `modelos/Tarea.js`

Los cinco campos y sus valores permitidos no se pueden cambiar: el frontend
espera exactamente estos.

```js
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  titulo:      { type: String, required: true },
  estado:      { type: String, enum: ['Pendiente', 'Completada'], default: 'Pendiente' },
  prioridad:   { type: String, enum: ['Alta', 'Media', 'Baja'],   default: 'Media' },
  categoria:   { type: String, default: '' },
  fechaLimite: { type: String, default: '' }   // formato YYYY-MM-DD, o cadena vacía
}, { timestamps: true });

module.exports = mongoose.model('Tarea', tareaSchema);
```

> `fechaLimite` es **String**, no `Date`. El frontend envía y espera `"2026-08-15"`.
> Usar `Date` haría que MongoDB devuelva un formato ISO con hora y zona horaria
> que el frontend no sabría mostrar.

---

## 4. `rutas/tareas.js`

```js
const express = require('express');
const Tarea = require('../modelos/Tarea');

const router = express.Router();

// Listar todas las tareas
router.get('/', async (req, res) => {
  try {
    const tareas = await Tarea.find().sort({ createdAt: -1 });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las tareas' });
  }
});

// Crear una tarea
router.post('/', async (req, res) => {
  try {
    const { titulo, estado, prioridad, categoria, fechaLimite } = req.body;
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }
    const tarea = await Tarea.create({ titulo, estado, prioridad, categoria, fechaLimite });
    res.status(201).json(tarea);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear la tarea' });
  }
});

// Editar una tarea
router.put('/:id', async (req, res) => {
  try {
    const { titulo, estado, prioridad, categoria, fechaLimite } = req.body;
    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      { titulo, estado, prioridad, categoria, fechaLimite },
      { new: true, runValidators: true }
    );
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo actualizar la tarea' });
  }
});

// Eliminar una tarea
router.delete('/:id', async (req, res) => {
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: 'No se pudo eliminar la tarea' });
  }
});

module.exports = router;
```

---

## 5. `server.js`

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());              // IMPRESCINDIBLE, ver la nota más abajo
app.use(express.json());

app.use('/api/tareas', require('./rutas/tareas'));

// Ruta de salud, útil para probar la conexión desde la otra máquina
app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', pod: process.env.HOSTNAME });
});

const PUERTO      = process.env.PORT        || 3000;
const MONGO_HOST  = process.env.MONGO_HOST  || 'localhost';
const MONGO_PORT  = process.env.MONGO_PORT  || '27017';
const MONGO_DB    = process.env.MONGO_DB    || 'tareasdb';
const MONGO_USER  = process.env.MONGO_USER;
const MONGO_PASS  = process.env.MONGO_PASSWORD;

const credenciales = MONGO_USER ? `${MONGO_USER}:${encodeURIComponent(MONGO_PASS)}@` : '';
const authSource   = MONGO_USER ? '?authSource=admin' : '';
const URI = `mongodb://${credenciales}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}${authSource}`;

mongoose.connect(URI)
  .then(() => {
    console.log(`Conectado a MongoDB en ${MONGO_HOST}:${MONGO_PORT}`);
    app.listen(PUERTO, () => console.log(`API escuchando en el puerto ${PUERTO}`));
  })
  .catch(error => {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  });
```

### ⚠️ Sobre CORS — el error más común de este proyecto

El navegador de la Máquina B pide los datos a **otra máquina**. Los navegadores
bloquean eso por seguridad salvo que el servidor lo autorice. Sin `app.use(cors())`
el frontend mostrará "No pudimos cargar tus tareas" aunque todo lo demás esté
perfecto, y el error solo se ve en la consola del navegador.

---

## 6. `Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

`.dockerignore`:

```
node_modules
.git
*.log
```

---

## 7. Probar en local antes de Kubernetes

```bash
docker build -t backend-tareas:1.0 .
```

```bash
docker run --rm -p 3000:3000 backend-tareas:1.0
```

Comprueba con el navegador o con curl que `http://localhost:3000/api/tareas`
responde. (Necesitarás un MongoDB corriendo para que conecte.)

Publicar en Docker Hub:

```bash
docker login
```

```bash
docker tag backend-tareas:1.0 TU_USUARIO/backend-tareas:1.0
```

```bash
docker push TU_USUARIO/backend-tareas:1.0
```

---

## 8. Manifiestos de Kubernetes

Crea una carpeta `k8s/` con estos cinco archivos.

### `k8s/mongo-secret.yaml`

La contraseña va codificada en base64. Para generarla:
`echo -n "clave123" | base64` → `Y2xhdmUxMjM=`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongo-secret
type: Opaque
data:
  MONGO_PASSWORD: Y2xhdmUxMjM=
```

### `k8s/backend-configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  MONGO_HOST: "mongo-service"
  MONGO_PORT: "27017"
  MONGO_DB: "tareasdb"
  MONGO_USER: "admin"
```

> `MONGO_HOST` es `mongo-service`, el nombre del Service de MongoDB. Kubernetes
> resuelve ese nombre por DNS interno, así que no hace falta ninguna IP.

### `k8s/mongo-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo
  labels:
    app: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
        - name: mongo
          image: mongo:7
          ports:
            - containerPort: 27017
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: MONGO_USER
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongo-secret
                  key: MONGO_PASSWORD
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  type: ClusterIP          # Solo accesible dentro del clúster
  selector:
    app: mongo
  ports:
    - port: 27017
      targetPort: 27017
```

### `k8s/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
spec:
  replicas: 2              # El profesor pide 2 réplicas
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: TU_USUARIO/backend-tareas:1.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: mongo-secret
          readinessProbe:
            httpGet:
              path: /api/salud
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

### `k8s/backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: NodePort           # Para que la Máquina B lo alcance por Tailscale
  selector:
    app: backend
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30081      # Puerto acordado, no cambiar
```

---

## 9. Desplegar

```bash
kubectl apply -f k8s/
```

```bash
kubectl get pods,services
```

Deben aparecer 2 pods de `backend` y 1 de `mongo`, todos en `Running`.

---

## 10. Datos que hay que enviar a la Máquina B

```bash
tailscale ip -4
```

Envía a tu compañera:

- Tu **IP de Tailscale** (empieza por `100.`)
- La confirmación de que el **NodePort es 30081**

Ella lo colocará en su ConfigMap como `http://TU_IP:30081`.

---

## 11. Comprobación conjunta

Desde la Máquina B, con Tailscale activo en ambas:

```bash
curl http://IP_DE_LA_MAQUINA_A:30081/api/tareas
```

Si devuelve `[]` o una lista de tareas, la conexión funciona y solo queda
actualizar el ConfigMap del frontend.

---

## Resumen de lo que no se puede cambiar

| Elemento              | Valor                                  |
|-----------------------|----------------------------------------|
| Rutas                 | `/api/tareas` y `/api/tareas/:id`      |
| Campos                | `titulo`, `estado`, `prioridad`, `categoria`, `fechaLimite` |
| Estados               | `Pendiente`, `Completada`              |
| Prioridades           | `Alta`, `Media`, `Baja`                |
| Formato de fecha      | `YYYY-MM-DD` como String               |
| Puerto interno        | `3000`                                 |
| NodePort              | `30081`                                |
| CORS                  | Habilitado                             |
