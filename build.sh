#!/usr/bin/env bash

# Salir en caso de error
set -e

# Instalar dependencias con cache
npm ci

# Construir la aplicación
npm run build

# Limpiar caché y módulos innecesarios
npm prune --production 