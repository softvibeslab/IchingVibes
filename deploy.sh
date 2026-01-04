#!/bin/bash

# ==========================================
# Script de Deployment para I Ching Oracle
# ==========================================

set -e  # Exit on error

echo "🎋 I Ching Oracle - Deployment Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check requirements
check_requirements() {
    echo -e "\n${YELLOW}Verificando requisitos...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose no está instalado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Docker y Docker Compose instalados${NC}"
}

# Check environment variables
check_env() {
    echo -e "\n${YELLOW}Verificando variables de entorno...${NC}"
    
    if [ -z "$GEMINI_USER_API_KEY" ]; then
        echo -e "${RED}GEMINI_USER_API_KEY no está definida${NC}"
        echo "Exportar con: export GEMINI_USER_API_KEY=tu_api_key"
        exit 1
    fi
    
    if [ -z "$SECRET_KEY" ]; then
        echo -e "${YELLOW}Generando SECRET_KEY...${NC}"
        export SECRET_KEY=$(openssl rand -hex 32)
    fi
    
    echo -e "${GREEN}✓ Variables de entorno configuradas${NC}"
}

# Build and start services
start_services() {
    echo -e "\n${YELLOW}Construyendo y levantando servicios...${NC}"
    
    docker-compose up -d --build
    
    echo -e "${GREEN}✓ Servicios iniciados${NC}"
}

# Wait for services to be ready
wait_for_services() {
    echo -e "\n${YELLOW}Esperando que los servicios estén listos...${NC}"
    
    # Wait for backend
    for i in {1..30}; do
        if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend listo${NC}"
            break
        fi
        echo "Esperando backend... ($i/30)"
        sleep 2
    done
    
    # Wait for frontend
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend listo${NC}"
            break
        fi
        echo "Esperando frontend... ($i/30)"
        sleep 2
    done
}

# Run health check
health_check() {
    echo -e "\n${YELLOW}Ejecutando health check...${NC}"
    
    HEALTH=$(curl -s http://localhost:8001/api/health)
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    
    if echo "$HEALTH" | grep -q '"status": "healthy"'; then
        echo -e "${GREEN}✓ Health check passed${NC}"
    else
        echo -e "${RED}✗ Health check failed${NC}"
        exit 1
    fi
}

# Show status
show_status() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}🚀 Deployment completado!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "URLs:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend:  http://localhost:8001"
    echo "  - API Docs: http://localhost:8001/docs"
    echo ""
    echo "Credenciales demo:"
    echo "  - Email: maria@demo.com"
    echo "  - Password: demo123"
    echo ""
    echo "Comandos útiles:"
    echo "  - Ver logs: docker-compose logs -f"
    echo "  - Detener:  docker-compose down"
    echo "  - Reiniciar: docker-compose restart"
}

# Main
main() {
    check_requirements
    check_env
    start_services
    wait_for_services
    health_check
    show_status
}

# Run
main
