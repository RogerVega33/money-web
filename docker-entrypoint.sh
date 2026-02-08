#!/bin/sh
set -eu

# Variable de entorno con valor por defecto
: "${BACKEND_URL:=http://localhost:3000}"

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
