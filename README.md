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

```bash
sudo docker build -t money-app-web .
sudo docker run --publish 80:80  money-app-web
```