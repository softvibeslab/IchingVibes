from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

from models import (
    UserRegister, UserLogin, User, UserResponse, Token,
    ReadingCreate, Reading, ReadingResponse, CoinThrow
)
from iching_data import get_hexagram
from interpretation_service import generate_deep_interpretation
from interpretation_service_custom import generate_custom_interpretation

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ.get("SECRET_KEY", "tu-clave-secreta-muy-segura-cambiala-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 días

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
readings_collection = db.readings

# Create the main app without a prefix
app = FastAPI(title="I Ching Oracle API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# === HEALTH CHECK ===
@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment verification"""
    try:
        # Test MongoDB connection
        await db.command('ping')
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "I Ching Oracle API",
        "database": db_status,
        "version": "1.0.0"
    }


# === UTILITY FUNCTIONS ===
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string for Pydantic model
    user["_id"] = str(user["_id"])
    return User(**user)


# === AUTH ROUTES ===
@api_router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Registrar nuevo usuario"""
    # Verificar si el email ya existe
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Iniciar sesión"""
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": credentials.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtener usuario actual"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at
    )


# === I CHING READING ROUTES ===
@api_router.post("/readings", response_model=ReadingResponse, status_code=status.HTTP_201_CREATED)
async def create_reading(
    reading_data: ReadingCreate,
    current_user: User = Depends(get_current_user)
):
    """Guardar una nueva lectura/consulta del I Ching"""
    
    # Crear documento de lectura
    reading_dict = {
        "user_id": str(current_user.id),
        "question": reading_data.question,
        "throws": [throw.dict() for throw in reading_data.throws],
        "present_hexagram": reading_data.present_hexagram,
        "future_hexagram": reading_data.future_hexagram,
        "has_changing_lines": reading_data.has_changing_lines,
        "changing_lines": reading_data.changing_lines,
        "created_at": datetime.utcnow()
    }
    
    result = await readings_collection.insert_one(reading_dict)
    reading_dict["_id"] = str(result.inserted_id)
    
    # Obtener datos completos de hexagramas
    present_hex_data = get_hexagram(reading_data.present_hexagram)
    future_hex_data = get_hexagram(reading_data.future_hexagram) if reading_data.future_hexagram else None
    
    return ReadingResponse(
        id=str(result.inserted_id),
        user_id=str(current_user.id),
        question=reading_data.question,
        throws=reading_data.throws,
        present_hexagram=present_hex_data,
        future_hexagram=future_hex_data,
        has_changing_lines=reading_data.has_changing_lines,
        changing_lines=reading_data.changing_lines,
        created_at=reading_dict["created_at"]
    )

@api_router.get("/readings", response_model=List[ReadingResponse])
async def get_readings(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    skip: int = 0
):
    """Obtener historial de lecturas del usuario"""
    readings = await readings_collection.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for reading in readings:
        present_hex_data = get_hexagram(reading["present_hexagram"])
        future_hex_data = get_hexagram(reading["future_hexagram"]) if reading.get("future_hexagram") else None
        
        result.append(ReadingResponse(
            id=str(reading["_id"]),
            user_id=reading["user_id"],
            question=reading.get("question"),
            throws=[CoinThrow(**throw) for throw in reading["throws"]],
            present_hexagram=present_hex_data,
            future_hexagram=future_hex_data,
            has_changing_lines=reading.get("has_changing_lines", False),
            changing_lines=reading.get("changing_lines", []),
            created_at=reading["created_at"]
        ))
    
    return result

@api_router.get("/readings/{reading_id}", response_model=ReadingResponse)
async def get_reading(
    reading_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener una lectura específica"""
    from bson import ObjectId
    
    try:
        reading = await readings_collection.find_one({
            "_id": ObjectId(reading_id),
            "user_id": str(current_user.id)
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lectura no encontrada"
        )
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lectura no encontrada"
        )
    
    present_hex_data = get_hexagram(reading["present_hexagram"])
    future_hex_data = get_hexagram(reading["future_hexagram"]) if reading.get("future_hexagram") else None
    
    return ReadingResponse(
        id=str(reading["_id"]),
        user_id=reading["user_id"],
        question=reading.get("question"),
        throws=[CoinThrow(**throw) for throw in reading["throws"]],
        present_hexagram=present_hex_data,
        future_hexagram=future_hex_data,
        has_changing_lines=reading.get("has_changing_lines", False),
        changing_lines=reading.get("changing_lines", []),
        created_at=reading["created_at"]
    )

@api_router.post("/readings/{reading_id}/interpret")
async def get_deep_interpretation(
    reading_id: str,
    current_user: User = Depends(get_current_user),
    use_custom: bool = True  # Por defecto usar la gema personalizada
):
    """Generar interpretación profunda usando IA (Gema personalizada o Gemini estándar)"""
    from bson import ObjectId
    
    try:
        reading = await readings_collection.find_one({
            "_id": ObjectId(reading_id),
            "user_id": str(current_user.id)
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lectura no encontrada"
        )
    
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lectura no encontrada"
        )
    
    # Obtener datos completos de hexagramas
    present_hex_data = get_hexagram(reading["present_hexagram"])
    future_hex_data = get_hexagram(reading["future_hexagram"]) if reading.get("future_hexagram") else None
    
    # Generar interpretación profunda usando el servicio elegido
    if use_custom:
        # Usar la gema personalizada del usuario
        result = generate_custom_interpretation(
            question=reading.get("question"),
            present_hexagram=present_hex_data,
            future_hexagram=future_hex_data,
            changing_lines=reading.get("changing_lines", []),
            has_changing_lines=reading.get("has_changing_lines", False),
            throws=reading.get("throws", [])
        )
    else:
        # Usar Gemini estándar (fallback)
        result = generate_deep_interpretation(
            question=reading.get("question"),
            present_hexagram=present_hex_data,
            future_hexagram=future_hex_data,
            changing_lines=reading.get("changing_lines", []),
            has_changing_lines=reading.get("has_changing_lines", False)
        )
    
    # Guardar la interpretación en la base de datos para caché
    await readings_collection.update_one(
        {"_id": ObjectId(reading_id)},
        {"$set": {"deep_interpretation": result["interpretation"], "interpretation_model": "custom_gem" if use_custom else "gemini_standard"}}
    )
    
    return {
        "reading_id": reading_id,
        "interpretation": result["interpretation"],
        "present_hexagram": present_hex_data,
        "future_hexagram": future_hex_data,
        "has_changing_lines": reading.get("has_changing_lines", False),
        "changing_lines": reading.get("changing_lines", []),
        "question": reading.get("question"),
        "model": result.get("model", "unknown"),
        "success": result.get("success", True)
    }

@api_router.get("/hexagrams/{number}")
async def get_hexagram_info(number: int):
    """Obtener información de un hexagrama específico"""
    if number < 1 or number > 64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de hexagrama debe estar entre 1 y 64"
        )
    
    hexagram = get_hexagram(number)
    if not hexagram:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hexagrama no encontrado"
        )
    
    return hexagram

@api_router.get("/")
async def root():
    return {
        "message": "I Ching Oracle API",
        "version": "1.0",
        "docs": "/docs"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
