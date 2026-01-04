#!/bin/bash

# ==========================================
# Quick Start Script for I Ching Oracle
# ==========================================

echo "🎋 I Ching Oracle - Quick Start"
echo "================================"

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  Creando backend/.env desde ejemplo..."
    cp backend/.env.example backend/.env
    echo "❗ IMPORTANTE: Edita backend/.env con tu GEMINI_USER_API_KEY"
fi

if [ ! -f frontend/.env ]; then
    echo "⚠️  Creando frontend/.env desde ejemplo..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "📋 Pasos para iniciar el proyecto:"
echo ""
echo "1. Configura las variables de entorno:"
echo "   nano backend/.env"
echo ""
echo "2. Inicia con Docker (recomendado):"
echo "   docker-compose up -d"
echo ""
echo "3. O manualmente:"
echo "   # Terminal 1 - Backend:"
echo "   cd backend && pip install -r requirements.txt"
echo "   uvicorn server:app --reload --port 8001"
echo ""
echo "   # Terminal 2 - Frontend:"
echo "   cd frontend && npm install"
echo "   npx expo start"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "🔑 Credenciales demo:"
echo "   Email: maria@demo.com"
echo "   Password: demo123"
