#!/usr/bin/env bash

# Salir en caso de error
set -e

echo "🚀 Iniciando proceso de build..."

# Limpiar caché y node_modules
echo "🧹 Limpiando caché y módulos..."
rm -rf .next
rm -rf node_modules

# Instalar dependencias con cache
echo "📦 Instalando dependencias..."
npm ci

# Verificar tipos
echo "✅ Verificando tipos..."
npm run type-check

# Ejecutar lint
echo "🔍 Ejecutando lint..."
npm run lint

# Construir la aplicación
echo "🏗️ Construyendo la aplicación..."
npm run build

# Limpiar caché y módulos innecesarios
echo "🧹 Limpiando módulos de desarrollo..."
npm prune --production

echo "✨ Build completado exitosamente!" 