#!/bin/bash
# Script de build para Vercel

# 1. Build de Vite (genera dist/)
npm run build

# 2. Copiar carpetas estáticas a dist/
cp -r onboarding dist/
cp -r admin dist/

echo "Build completo: dist/ contiene onboarding/ y admin/"
