# TP-13 — Sistema de Reservas de Salas con Consultas Web y MongoDB

## Descripción

Aplicación web desarrollada con Node.js, Express, EJS, MongoDB Atlas y Mongoose para gestionar reservas de salas.

Este trabajo práctico continúa el TP12 e incorpora búsqueda literal por estudiante, filtro exacto por sala, ordenamiento y paginación desde la interfaz web y la API REST. Ambas entradas comparten la función `leerCriterios()` y el servicio `buscar()`, sin realizar solicitudes HTTP internas.

La aplicación permite crear, listar, consultar, editar y eliminar reservas, almacenando los datos de manera persistente en MongoDB Atlas.

También dispone de una API REST para consultar y administrar las reservas mediante solicitudes HTTP y respuestas JSON.

## Tecnologías utilizadas

- Node.js
- JavaScript
- Express.js
- MongoDB Atlas
- Mongoose
- EJS
- express-ejs-layouts
- Morgan
- Postman
- ESLint
- Prettier

## Estructura del proyecto

El proyecto mantiene la organización modular de las unidades anteriores:

- `src/config/`: configuración del entorno y conexión a MongoDB.
- `src/controladores/`: controladores de la aplicación web y de la API.
- `src/middleware/`: validaciones, seguimiento de solicitudes y manejo de errores.
- `src/modelos/`: modelo de reserva de Mongoose.
- `src/rutas/`: rutas web y rutas de la API.
- `src/servicios/`: operaciones sobre las reservas almacenadas en MongoDB.
- `views/`: plantillas EJS de la interfaz web.
- `public/`: archivos estáticos.
- `scripts/`: scripts auxiliares.

## Instalación y configuración

1. Clonar o descargar el repositorio.
2. Abrir una terminal en la carpeta del proyecto.
3. Instalar las dependencias:

```bash
npm ci
```

4. Crear el archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.
5. Configurar la variable `MONGODB_URI` con la conexión a MongoDB Atlas.

La base de datos prevista para este trabajo práctico es `reservas_salas_u13` y la colección es `reservas`.

El archivo `.env` contiene información privada y no debe incluirse en el repositorio.

## Ejecución

Iniciar el servidor con:

```bash
node --env-file=.env src/index.js
```

También puede iniciarse con `npm start`.

La aplicación estará disponible en:

`http://localhost:3000`

## Funcionalidades de la aplicación web

### Crear reservas

Permite registrar una nueva reserva desde un formulario web.

Cada reserva contiene los siguientes campos:

- Estudiante
- Email
- Sala
- Fecha
- Turno
- Cantidad de personas
- Estado

### Listar reservas

Muestra las reservas almacenadas en MongoDB mediante un formulario GET con búsqueda, filtro, orden y límite. Los enlaces Anterior y Siguiente conservan los criterios mediante `URLSearchParams`. Una nueva búsqueda vuelve a la primera página; Limpiar criterios restablece los valores predeterminados. Se informa cuando no hay coincidencias o cuando la página solicitada está fuera de rango.

Ruta:

`GET /reservas`

### Consultar una reserva

Permite visualizar los datos de una reserva mediante su identificador.

Ruta:

`GET /reservas/:id`

### Editar una reserva

Permite modificar todos los campos de una reserva existente desde la interfaz web.

Ruta para mostrar el formulario:

`GET /reservas/:id/editar`

Ruta para guardar los cambios:

`POST /reservas/:id/editar`

El servidor valida los datos recibidos y utiliza el servicio MongoDB para reemplazar la reserva mediante `findOneAndReplace()`, con las validaciones de Mongoose activadas.

Cuando la operación finaliza correctamente, el servidor responde con HTTP 303 y redirige al detalle de la reserva.

El identificador original se conserva.

### Cambiar parcialmente el estado de una reserva

La aplicación conserva un formulario específico para modificar únicamente el estado de una reserva.

Ruta para mostrar el formulario:

`GET /reservas/:id/estado`

Ruta para guardar el cambio:

`POST /reservas/:id/estado`

El formulario permite seleccionar uno de los estados admitidos:

- `pendiente`
- `confirmada`

El servidor valida que la solicitud contenga únicamente el campo `estado`.

La actualización se realiza mediante `findOneAndUpdate()`, utilizando el servicio MongoDB existente.

Después de guardar correctamente, el servidor responde con HTTP 303 y redirige al detalle de la reserva.

Los demás campos permanecen sin modificaciones.

### Eliminar una reserva

La aplicación conserva la eliminación de reservas desde la interfaz web mediante una pantalla de confirmación.

Ruta para mostrar la confirmación:

`GET /reservas/:id/eliminar`

Ruta para ejecutar la eliminación:

`POST /reservas/:id/eliminar`

La pantalla muestra los datos de la reserva y permite confirmar o cancelar la operación.

- **Cancelar:** regresa al detalle sin eliminar la reserva.
- **Confirmar eliminación:** ejecuta la operación mediante `deleteOne()` y redirige al listado con HTTP 303.

La eliminación es definitiva.

Si la reserva no existe, la aplicación devuelve HTTP 404.

## Validaciones

La aplicación comprueba que:

- El estudiante no esté vacío.
- El email contenga `@`.
- La sala sea Norte, Sur o Multimedia.
- La fecha no esté vacía.
- El turno sea Mañana, Tarde o Noche.
- La cantidad de personas sea un número entero entre 1 y 6.
- El estado sea `pendiente` o `confirmada`.
- No se reciban campos adicionales en el reemplazo web.
- El cambio parcial contenga únicamente un estado válido.

Las solicitudes de edición o actualización parcial inválidas devuelven HTTP 400.

Los identificadores inválidos se rechazan y las reservas inexistentes se informan mediante HTTP 404.

## API REST

La aplicación conserva las operaciones desarrolladas en las unidades anteriores.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reservas` | Consultar reservas |
| GET | `/api/reservas/consulta` | Búsqueda, filtro, orden y paginación compartidos con la web |
| GET | `/api/reservas/:id` | Consultar una reserva |
| POST | `/api/reservas` | Crear una reserva |
| PUT | `/api/reservas/:id` | Reemplazar una reserva |
| PATCH | `/api/reservas/:id` | Actualizar parcialmente |
| DELETE | `/api/reservas/:id` | Eliminar una reserva |

El endpoint heredado `GET /api/reservas` conserva su contrato paginado y sus parámetros `sala`, `orden`, `pagina` y `limite`. El detalle devuelve una reserva individual. La consulta ampliada se encuentra en `GET /api/reservas/consulta`.

## Criterios de consulta

Los endpoints `GET /reservas` y `GET /api/reservas/consulta` admiten los mismos criterios:

| Parámetro | Regla | Predeterminado |
|---|---|---|
| `q` | Fragmento literal del estudiante, máximo 60 caracteres, sin distinguir mayúsculas; distingue tildes | Vacío |
| `sala` | Coincidencia exacta, máximo 80 caracteres | Vacío |
| `orden` | `estudiante`, `personas-asc`, `personas-desc` | `estudiante` |
| `pagina` | Entero entre 1 y 1000 | 1 |
| `limite` | Entero entre 1 y 20 | 2 |

La búsqueda por estudiante encuentra fragmentos del nombre; el filtro por sala exige igualdad exacta. Ambos criterios se combinan y se eliminan los espacios exteriores. Los signos especiales de la búsqueda se escapan para que MongoDB los interprete literalmente. El orden utiliza `_id` como desempate.

Se rechazan parámetros repetidos, desconocidos, no textuales y valores inválidos. No se admiten operadores MongoDB enviados desde la URL.

La consulta cuenta los documentos con el mismo filtro mediante `countDocuments()` y aplica `sort()`, `skip()` y `limit()`. El total de páginas se calcula con `Math.ceil(total / limite)`.

La API devuelve un objeto JSON con `datos`, `pagina`, `limite`, `total` y `paginas`. Una consulta sin coincidencias o una página válida fuera de rango responde HTTP 200 con `datos: []`. Los criterios inválidos responden HTTP 400, en JSON para la API y HTML para la web.

Ejemplo de consulta equivalente:

- Web: `http://localhost:3000/reservas?q=ana&sala=Sala%20Norte&orden=personas-desc&pagina=2&limite=2`
- API: `http://localhost:3000/api/reservas/consulta?q=ana&sala=Sala%20Norte&orden=personas-desc&pagina=2&limite=2`

## Pruebas realizadas

Se utilizaron seis reservas ficticias y una reserva adicional temporal para comprobar la continuidad del CRUD. Las solicitudes GET de Postman no requieren body.

| Solicitud (ruta relativa a http://localhost:3000) | Resultado comprobado |
|---|---|
| `/api/reservas/consulta` | 200; total 6, página 1, límite 2, páginas 3 |
| `/reservas?q=ana` | Cuatro coincidencias |
| `/reservas?q=ana&sala=Sala%20Norte&orden=personas-desc&limite=2` | Total 3; dos reservas en la primera página; Siguiente conserva criterios |
| `/api/reservas/consulta?q=ana&sala=Sala%20Norte&orden=personas-desc&pagina=2&limite=2` | 200; Ana Alba, total 3, páginas 2 |
| `/api/reservas/consulta?q=A%2BB` | 200; una coincidencia: Carla (A+B) |
| `/api/reservas/consulta?q=%5B` | 200; total 0 |
| `/api/reservas/consulta?q=.*` | 200; total 0 |
| `/api/reservas/consulta?q=ZZZsincoincidencias` | 200; datos vacío, total 0, páginas 0 |
| `/reservas?q=ZZZsincoincidencias` | Mensaje No hay coincidencias; conserva el texto |
| `/api/reservas/consulta?pagina=10&limite=2` | 200; datos vacío, total 6, páginas 3 |
| `/reservas?q=ana&sala=Sala%20Norte&pagina=3&limite=2` | Página fuera de rango; regreso a primera página con criterios conservados |
| `/api/reservas/consulta?pagina=0` | 400 JSON |
| `/api/reservas/consulta?limite=21` | 400 JSON |
| `/reservas?pagina=0` | 400 HTML con enlace al listado |
| `/api/reservas` | 200; contrato heredado conservado |
| `/api/reservas/:id` | 200 para una reserva existente |

También se comprobó el reinicio de la paginación al enviar una nueva búsqueda y el restablecimiento de criterios mediante Limpiar.

### Continuidad del CRUD

- Alta de una reserva temporal desde la web: total 7.
- Edición completa conservando el identificador.
- Cambio parcial a estado `confirmada`, conservando los demás campos.
- Consulta por ID desde Postman: HTTP 200 con los datos actualizados.
- Eliminación con confirmación: total nuevamente 6.
- Consulta del ID eliminado: HTTP 404.
- Reinicio del servidor y nueva consulta: las seis reservas originales persisten en MongoDB Atlas.

### Ejemplos de respuesta

Consulta sin coincidencias (`GET /api/reservas/consulta?q=ZZZsincoincidencias`):

```json
{
  "datos": [],
  "pagina": 1,
  "limite": 2,
  "total": 0,
  "paginas": 0
}
```

Consulta fuera de rango (`GET /api/reservas/consulta?pagina=10&limite=2`):

```json
{
  "datos": [],
  "pagina": 10,
  "limite": 2,
  "total": 6,
  "paginas": 3
}
```

## Verificación del código

Para comprobar el formato y las reglas de calidad:

```bash
npm run check
```

Se ejecutó correctamente la verificación de Prettier y ESLint, sin errores.

## Conclusión

El TP13 amplía el sistema de reservas con consultas compartidas entre la web y la API REST, búsqueda literal, filtros, ordenamiento y paginación en MongoDB. Se mantienen las operaciones CRUD y las validaciones de las unidades anteriores, con almacenamiento persistente en MongoDB Atlas.
