#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🔍 Script de Validación de Deployment - I Ching Oracle
# ═══════════════════════════════════════════════════════════════
# 
# USO:
#   chmod +x validate_deployment.sh
#   ./validate_deployment.sh
#
# CONFIGURACIÓN:
#   Edita las variables DOMAIN y API_DOMAIN antes de ejecutar
#
# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN - EDITAR ESTOS VALORES
# ═══════════════════════════════════════════════════════════════
DOMAIN="tu-dominio.com"
API_DOMAIN="api.tu-dominio.com"
DEMO_EMAIL="maria@demo.com"
DEMO_PASSWORD="demo123"

# Nombres de contenedores (ajustar si usas otros nombres)
MONGO_CONTAINER="iching-mongodb"
BACKEND_CONTAINER="iching-backend"
FRONTEND_CONTAINER="iching-frontend"

# ═══════════════════════════════════════════════════════════════
# COLORES Y UTILIDADES
# ═══════════════════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0
PASSED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ═══════════════════════════════════════════════════════════════
# INICIO
# ═══════════════════════════════════════════════════════════════
clear
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔍 VALIDACIÓN DE DEPLOYMENT - I Ching Physics Oracle      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Configuración:"
echo "  Domain:     $DOMAIN"
echo "  API Domain: $API_DOMAIN"
echo "  Demo User:  $DEMO_EMAIL"

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 1: DOCKER
# ═══════════════════════════════════════════════════════════════
section "📦 SECCIÓN 1: CONTENEDORES DOCKER"

# 1.1 Docker está corriendo
echo -n "1.1 Docker daemon: "
if docker info > /dev/null 2>&1; then
    check_pass "Docker funcionando"
else
    check_fail "Docker no está corriendo"
fi

# 1.2 MongoDB
echo -n "1.2 MongoDB container: "
if docker ps --format '{{.Names}}' | grep -q "$MONGO_CONTAINER"; then
    check_pass "Corriendo"
else
    check_fail "No encontrado"
fi

# 1.3 Backend
echo -n "1.3 Backend container: "
if docker ps --format '{{.Names}}' | grep -q "$BACKEND_CONTAINER"; then
    check_pass "Corriendo"
else
    check_fail "No encontrado"
fi

# 1.4 Frontend
echo -n "1.4 Frontend container: "
if docker ps --format '{{.Names}}' | grep -q "$FRONTEND_CONTAINER"; then
    check_pass "Corriendo"
else
    check_fail "No encontrado"
fi

# 1.5 Mostrar estado de contenedores
echo ""
echo "Estado actual de contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "iching|mongo|backend|frontend|NAMES"

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 2: MONGODB
# ═══════════════════════════════════════════════════════════════
section "🗄️  SECCIÓN 2: MONGODB"

# 2.1 Ping MongoDB
echo -n "2.1 MongoDB ping: "
if docker exec $MONGO_CONTAINER mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    check_pass "Respondiendo"
else
    check_fail "No responde"
fi

# 2.2 Autenticación
echo -n "2.2 Autenticación: "
if docker exec $MONGO_CONTAINER mongosh -u iching_user --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    check_pass "Credenciales válidas"
else
    check_warn "Verificar credenciales"
fi

# 2.3 Base de datos existe
echo -n "2.3 Base de datos: "
DBS=$(docker exec $MONGO_CONTAINER mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d=>d.name).join(',')" 2>/dev/null)
if echo "$DBS" | grep -q "iching"; then
    check_pass "iching_production existe"
else
    check_warn "Base de datos no encontrada (se creará al primer uso)"
fi

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 3: BACKEND
# ═══════════════════════════════════════════════════════════════
section "⚙️  SECCIÓN 3: BACKEND API"

# 3.1 Health check interno
echo -n "3.1 Health check interno: "
HEALTH=$(docker exec $BACKEND_CONTAINER curl -s http://localhost:8001/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    check_pass "Healthy"
    echo "    Respuesta: $HEALTH"
else
    check_fail "No responde"
fi

# 3.2 Conexión a MongoDB desde backend
echo -n "3.2 Conexión a MongoDB: "
if echo "$HEALTH" | grep -q '"database":"healthy"'; then
    check_pass "Conectado"
else
    check_fail "No conectado a MongoDB"
fi

# 3.3 Variables de entorno
echo -n "3.3 Variables de entorno: "
ENVS=$(docker exec $BACKEND_CONTAINER env 2>/dev/null)
MISSING=""
echo "$ENVS" | grep -q "MONGO_URL" || MISSING="$MISSING MONGO_URL"
echo "$ENVS" | grep -q "GEMINI" || MISSING="$MISSING GEMINI_USER_API_KEY"
echo "$ENVS" | grep -q "SECRET_KEY" || MISSING="$MISSING SECRET_KEY"

if [ -z "$MISSING" ]; then
    check_pass "Todas configuradas"
else
    check_fail "Faltan:$MISSING"
fi

# 3.4 Logs recientes
echo ""
echo "Últimos logs del backend:"
docker logs --tail 5 $BACKEND_CONTAINER 2>&1 | head -10

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 4: FRONTEND
# ═══════════════════════════════════════════════════════════════
section "🌐 SECCIÓN 4: FRONTEND"

# 4.1 Nginx corriendo
echo -n "4.1 Nginx: "
if docker exec $FRONTEND_CONTAINER nginx -t > /dev/null 2>&1; then
    check_pass "Configuración válida"
else
    check_fail "Error en configuración"
fi

# 4.2 index.html existe
echo -n "4.2 Build existe: "
if docker exec $FRONTEND_CONTAINER test -f /usr/share/nginx/html/index.html; then
    check_pass "index.html presente"
else
    check_fail "index.html no encontrado"
fi

# 4.3 Health check interno
echo -n "4.3 Health check: "
if docker exec $FRONTEND_CONTAINER curl -s http://localhost/health | grep -q "healthy"; then
    check_pass "Respondiendo"
else
    check_warn "Health endpoint no configurado"
fi

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 5: CONECTIVIDAD EXTERNA
# ═══════════════════════════════════════════════════════════════
section "🔗 SECCIÓN 5: CONECTIVIDAD EXTERNA"

# 5.1 Frontend HTTP
echo -n "5.1 Frontend (HTTP): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    check_pass "HTTP $HTTP_CODE"
else
    check_fail "HTTP $HTTP_CODE"
fi

# 5.2 Frontend HTTPS
echo -n "5.2 Frontend (HTTPS): "
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$DOMAIN" 2>/dev/null)
if [ "$HTTPS_CODE" = "200" ]; then
    check_pass "HTTPS $HTTPS_CODE"
else
    check_warn "HTTPS $HTTPS_CODE (SSL pendiente)"
fi

# 5.3 API HTTP
echo -n "5.3 API (HTTP): "
API_HEALTH=$(curl -s "http://$API_DOMAIN/api/health" 2>/dev/null)
if echo "$API_HEALTH" | grep -q '"healthy"'; then
    check_pass "Funcionando"
else
    check_fail "No responde"
fi

# 5.4 API HTTPS
echo -n "5.4 API (HTTPS): "
API_HEALTH_S=$(curl -s --max-time 5 "https://$API_DOMAIN/api/health" 2>/dev/null)
if echo "$API_HEALTH_S" | grep -q '"healthy"'; then
    check_pass "Funcionando"
else
    check_warn "SSL pendiente"
fi

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 6: FUNCIONALIDAD
# ═══════════════════════════════════════════════════════════════
section "🧪 SECCIÓN 6: PRUEBAS FUNCIONALES"

# Determinar URL a usar
if echo "$API_HEALTH_S" | grep -q '"healthy"'; then
    API_URL="https://$API_DOMAIN"
else
    API_URL="http://$API_DOMAIN"
fi

# 6.1 Login
echo -n "6.1 Login: "
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}" 2>/dev/null)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    check_pass "Token obtenido"
else
    check_fail "Error: $LOGIN_RESPONSE"
fi

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    # 6.2 Get user
    echo -n "6.2 Obtener usuario: "
    USER=$(curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    if echo "$USER" | grep -q "email"; then
        check_pass "OK"
    else
        check_fail "Error"
    fi

    # 6.3 List readings
    echo -n "6.3 Listar lecturas: "
    READINGS=$(curl -s "$API_URL/api/readings" -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    if echo "$READINGS" | grep -q "\["; then
        COUNT=$(echo "$READINGS" | grep -o '"id"' | wc -l)
        check_pass "$COUNT lecturas"
    else
        check_fail "Error"
    fi
fi

# ═══════════════════════════════════════════════════════════════
# SECCIÓN 7: RECURSOS
# ═══════════════════════════════════════════════════════════════
section "💻 SECCIÓN 7: RECURSOS DEL SISTEMA"

# Disco
DISK_PCT=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
echo -n "7.1 Disco ($DISK_PCT% usado): "
if [ "$DISK_PCT" -lt 80 ]; then
    check_pass "OK"
elif [ "$DISK_PCT" -lt 90 ]; then
    check_warn "Considerar limpiar"
else
    check_fail "Crítico"
fi

# Memoria
MEM_PCT=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
echo -n "7.2 Memoria ($MEM_PCT% usada): "
if [ "$MEM_PCT" -lt 80 ]; then
    check_pass "OK"
elif [ "$MEM_PCT" -lt 90 ]; then
    check_warn "Alta"
else
    check_fail "Crítica"
fi

# Docker disk
echo ""
echo "Uso de disco Docker:"
docker system df 2>/dev/null

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                      📊 RESUMEN FINAL                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$((PASSED + ERRORS + WARNINGS))
echo "Resultados:"
echo -e "  ${GREEN}✅ Pasaron:      $PASSED${NC}"
echo -e "  ${RED}❌ Errores:      $ERRORS${NC}"
echo -e "  ${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            🎉 ¡DEPLOYMENT EXITOSO!                            ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         ❌ DEPLOYMENT CON ERRORES - Revisar arriba            ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URLs de tu aplicación:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Frontend:  https://$DOMAIN"
echo "  API:       https://$API_DOMAIN"
echo "  API Docs:  https://$API_DOMAIN/docs"
echo "  Health:    https://$API_DOMAIN/api/health"
echo ""
echo "🔑 Credenciales demo:"
echo "  Email:     $DEMO_EMAIL"
echo "  Password:  $DEMO_PASSWORD"
echo ""

exit $ERRORS
