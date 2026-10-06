#!/bin/sh
set -eu

# Variable de entorno con valor por defecto
: "${BACKEND_URL:=http://localhost:3000}"
export BACKEND_URL

# Sin configurar un proxy, se conserva la dirección de la conexión.
: > /etc/nginx/real-ip.conf
if [ -n "${TRUSTED_PROXY_IP:-}" ]; then
  case "$TRUSTED_PROXY_IP" in
    *[!0-9a-fA-F:./]*)
      printf '%s\n' 'TRUSTED_PROXY_IP debe ser una IP o CIDR del proxy inverso.' >&2
      exit 1
      ;;
  esac
  printf 'set_real_ip_from %s;\n' "$TRUSTED_PROXY_IP" > /etc/nginx/real-ip.conf
fi

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

nginx -t
exec nginx -g 'daemon off;'
