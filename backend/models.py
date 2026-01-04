from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    email: EmailStr
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# I Ching Reading Models
class CoinThrow(BaseModel):
    """Representa una tirada de 3 monedas"""
    coins: List[int]  # Lista de 3 valores: 2 (cruz) o 3 (cara)
    sum: int  # Suma total: 6, 7, 8, o 9
    line_type: str  # "yin_fija", "yang_fija", "yin_movil", "yang_movil"
    line_value: int  # 0 (yin) o 1 (yang)

class ReadingCreate(BaseModel):
    """Crear nueva consulta/lectura"""
    question: Optional[str] = None  # Pregunta del usuario (opcional)
    throws: List[CoinThrow]  # 6 tiradas de monedas
    present_hexagram: int  # Número del hexagrama presente (1-64)
    future_hexagram: Optional[int] = None  # Número del hexagrama futuro si hay líneas móviles
    has_changing_lines: bool = False
    changing_lines: List[int] = []  # Posiciones de líneas móviles (1-6)

class Reading(BaseModel):
    """Lectura completa del I Ching"""
    id: Optional[str] = Field(alias="_id")
    user_id: str
    question: Optional[str] = None
    throws: List[CoinThrow]
    present_hexagram: int
    future_hexagram: Optional[int] = None
    has_changing_lines: bool = False
    changing_lines: List[int] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ReadingResponse(BaseModel):
    """Respuesta de lectura con interpretación completa"""
    id: str
    user_id: str
    question: Optional[str] = None
    throws: List[CoinThrow]
    present_hexagram: dict  # Datos completos del hexagrama presente
    future_hexagram: Optional[dict] = None  # Datos completos del hexagrama futuro
    has_changing_lines: bool
    changing_lines: List[int]
    created_at: datetime
