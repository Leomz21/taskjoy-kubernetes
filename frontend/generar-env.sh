#!/bin/sh
# Escribe la URL de la API dentro de la imagen ya construida.
: "${API_URL:=http://localhost:3000}"
echo "window.__API_URL__ = \"${API_URL}\";" > /usr/share/nginx/html/env.js
echo "[frontend] API_URL configurada como: ${API_URL}"