# I Ching Oracle - Deployment Status

## Production Environment

**Server**: Hostinger VPS with Easypanel
**IP Address**: 31.97.145.53
**Deployment Date**: 2026-01-04

---

## Service Status

| Service | Container | Status | Port | Image |
|---------|-----------|--------|------|-------|
| MongoDB | iching-mongodb | Running (healthy) | 27017 | mongo:7.0 |
| Backend API | iching-backend | Running (healthy) | 8001 | iching-backend:latest |
| Frontend | iching-frontend | Running (healthy) | 8080 | iching-frontend:latest |

---

## Access URLs

| Resource | URL |
|----------|-----|
| Frontend App | http://31.97.145.53:8080 |
| Backend API | http://31.97.145.53:8001 |
| API Health Check | http://31.97.145.53:8001/api/health |
| API Documentation | http://31.97.145.53:8001/docs |
| Easypanel Dashboard | http://31.97.145.53:3000 |

---

## Demo Users

| Email | Password | Name |
|-------|----------|------|
| maria@demo.com | demo123 | Maria Demo |
| carlos@demo.com | demo123 | Carlos Demo |
| ana@demo.com | demo123 | Ana Demo |

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB 7.0
- **Authentication**: JWT
- **AI Service**: Google Gemini API

### Frontend
- **Framework**: Expo (React Native)
- **Router**: Expo Router
- **State Management**: Zustand
- **Build**: Static web export served by Nginx

---

## Docker Network Configuration

All services run on the `iching-oracle_iching-network` Docker network:

```
Network: iching-oracle_iching-network
├── iching-mongodb (172.21.0.2)
├── iching-backend (connects to mongodb:27017)
└── iching-frontend (connects to backend:8001)
```

---

## Environment Variables

### Backend (.env)

```env
MONGO_URL=mongodb://iching_user:[PASSWORD]@mongodb:27017/iching_production?authSource=admin
DB_NAME=iching_production
GEMINI_USER_API_KEY=[YOUR_API_KEY]
SECRET_KEY=[GENERATED_SECRET]
PORT=8001
```

### Frontend (.env)

```env
EXPO_PUBLIC_BACKEND_URL=http://31.97.145.53:8001
```

---

## Deployment Commands

### Rebuild and Redeploy Backend

```bash
cd /etc/easypanel/projects/iching-oracle/iching/IchingVibes/backend
docker build -t iching-backend:latest .
docker rm -f iching-backend
docker run -d \
  --name iching-backend \
  --network iching-oracle_iching-network \
  -p 8001:8001 \
  --env-file .env \
  --restart unless-stopped \
  iching-backend:latest
```

### Rebuild and Redeploy Frontend

```bash
cd /etc/easypanel/projects/iching-oracle/iching/IchingVibes/frontend
docker build -t iching-frontend:latest \
  --build-arg EXPO_PUBLIC_BACKEND_URL=http://31.97.145.53:8001 \
  -f Dockerfile.production .
docker rm -f iching-frontend
docker run -d \
  --name iching-frontend \
  --network iching-oracle_iching-network \
  -p 8080:80 \
  --restart unless-stopped \
  iching-frontend:latest
```

---

## Health Check

```bash
# Check all services
docker ps | grep iching

# Check API health
curl http://31.97.145.53:8001/api/health

# Check frontend
curl -I http://31.97.145.53:8080

# View backend logs
docker logs iching-backend --tail 50

# View frontend logs
docker logs iching-frontend --tail 50
```

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB status
docker logs iching-mongodb --tail 20

# Test MongoDB connection
docker exec iching-mongodb mongosh -u iching_user -p 'TuPasswordSeguro123!' --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Backend Not Starting

```bash
# Check logs for errors
docker logs iching-backend

# Verify environment variables
docker exec iching-backend env | grep -E "MONGO|GEMINI|SECRET"
```

### Frontend Not Loading

```bash
# Check nginx configuration
docker exec iching-frontend cat /etc/nginx/conf.d/default.conf

# Check if build files exist
docker exec iching-frontend ls -la /usr/share/nginx/html/
```

---

## Future Improvements

- [ ] Configure custom domain
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set up automated backups for MongoDB
- [ ] Configure monitoring and alerting
- [ ] Implement CI/CD pipeline

---

**Last Updated**: 2026-01-04
**Deployed By**: MoAI-ADK Automated Deployment
