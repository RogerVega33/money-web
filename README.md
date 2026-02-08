# Money app Frontend

Money app te ayuda a llevar un registro de tus gastos

## Installation

### Node
Ejecutar:

```
npm install
npm run serve
```
### Docker compose
Editar las variables de entorno en el archivo .env.

Ejecutar:

```bash
docker-compose up
```

### Docker
Ejecutar:

Creación de la imagen
```bash
docker build -t money-app-web .
```
Ejecución con el backend en localhost
```bash
docker run -d -p 80:80 \
--add-host=host.docker.internal:host-gateway \
-e BACKEND_URL="http://host.docker.internal:3000" \
money-app-web
```
Ejecución con el backend en otra máquina
```bash
docker run -d -p 80:80 -e BACKEND_URL="http://ip_backend:3000" money-app-web
```
