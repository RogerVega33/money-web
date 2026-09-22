# Money App Frontend

Money App te ayuda a llevar un registro de tus gastos

## Instalación

### Configuración URL del backend

Para desarrollo con Vue, el archivo `.env` es opcional y
[`.env.example`](.env.example) sirve de guía.

La variable `BACKEND_URL` especifica la URL del backend.

En Docker Compose, la URL está fijada en el YAML y `.env` contiene las variables
del **backend**, no la configuración del frontend.

El navegador solicita
`/api` al mismo sitio del frontend; el proxy de Vue (desarrollo) o Nginx (Docker)
reenvía esas peticiones al backend.

| Ejecución | Configuración | Valor por defecto |
| --- | --- | --- |
| `npm run serve` | `BACKEND_URL` en `.env`, leída por `vite.config.mjs` | `http://localhost:3000` |
| Docker Compose | `BACKEND_URL` definida directamente en `docker-compose.yml` | `http://backend:3000` |
| Docker | `docker run -e BACKEND_URL="http://ip_backend:3000" ...` | Pasar la URL explícitamente |

### Node

Usa Node.js 22.13+ o 24+.

Instala las dependencias del proyecto fijadas en el lockfile:
```bash
npm ci
```

Levanta el servidor:
```
npm run serve
```

El servidor de desarrollo abre en `http://localhost:8080`. `npm run dev` es un
alias de `npm run serve`; el puerto debe estar libre. Los puertos están definidos 
en el archivo `vite.config.mjs`

```bash
npm run lint
npm test
npm run build
npm run preview
```

`build` genera `dist`. `preview` permite probar esa compilación en
`http://localhost:4173` con el mismo proxy al backend; es una herramienta local,
no un servidor de producción.

### Docker

Creación de la imagen:
```bash
docker build -t money-app-web .
```
Ejecución con el backend en localhost:
```bash
docker run -d -p 80:80 \
--add-host=host.docker.internal:host-gateway \
-e BACKEND_URL="http://host.docker.internal:3000" \
money-app-web
```
Ejecución con el backend en otra máquina:
```bash
docker run -d -p 80:80 -e BACKEND_URL="http://ip_backend:3000" money-app-web
```

### Docker compose
El archivo [docker-compose.yml](docker-compose.yml) levanta tanto el frontend como el backend. Requiere las imágenes
`money-app-web:latest` y `money-app:latest` disponibles.

Para desplegar en otro servidor no hace falta copiar el repositorio. Colocar
estos dos archivos en la misma carpeta, ejemplo:

```text
money-app/
├── docker-compose.yml
└── .env
```

El `.env` es obligatorio y contiene las variables **del backend**.

El frontend no necesita un archivo de variables de configuración:
`BACKEND_URL=http://backend:3000` está definida directamente en el Compose.
Docker resuelve `backend` al servicio incluido.
Mantener `API_PORT=3000` en el backend para coincidir con esa URL.

El puerto del frontend por defecto es `8085` puedes cambiarlo en la sección de ports.

Ejecuta desde la carpeta que contiene ambos archivos:

```bash
docker compose up -d
```
Puedes ingresar a la app con:
* Desde tu máquina: http://localhost:8085
* Desde otro dispositivo: http://IP_DEL_SERVIDOR:8085

## Instalación en Android (PWA)

La web incluye un manifiesto para instalar **Money App** en Android como acceso directo 
y abrirla en una ventana independiente. Los siguientes pasos funcionan para el navegador Chrome:

1. Desde Android, abrir en el navegador la URL donde se encuentre deplegado Money App.
3. En el menú del navegador, elegir **Añadir a pantalla de inicio → Instalar**
   o **Instalar aplicación**, según la versión del navegador.
4. Se creará un ícono de acceso directo a Money App. Abrir Money App desde su icono.
