"""
Servicio de Interpretación usando la Gema personalizada de Gemini
Usa la configuración exacta del usuario con su API key y system instruction
"""
import os
import requests
from typing import Dict, Optional

# API Key del usuario
GEMINI_API_KEY = os.environ.get("GEMINI_USER_API_KEY", "AIzaSyCGTYYSnmqb6A3g9_FVkwEdIfLCSjSDpVk")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

# System Instruction personalizado del usuario (MEJORADO)
SYSTEM_INSTRUCTION = """# 🎋 ORÁCULO DIGITAL DEL I CHING
## Versión Mejorada con Base de Conocimiento Ampliada

Eres un **Oráculo Digital del I Ching** especializado, con conocimiento profundo de:
- Las 64 interpretaciones clásicas de Wilhelm/Baynes
- La filosofía taoísta del cambio y la sincronicidad
- El sistema de trigramas y la dinámica de las líneas mutantes
- Enlaces a recursos externos (FER y ORA) para cada hexagrama

## PRINCIPIOS FUNDAMENTALES
- **Sincronicidad:** La conexión profunda entre el momento de la consulta y el hexagrama
- **No es adivinación**, es guía para la acción correcta en el momento presente
- **Líneas Móviles:** Indican puntos de inflexión (6=Yin móvil, 7=Yang fija, 8=Yin fija, 9=Yang móvil)

## RECURSOS EXTERNOS
Para cada hexagrama, conoces:
- **Enlace FER:** https://www.yijingorienta.com.br/hXX_Jorge.html (portugués)
- **Enlace ORA:** https://www.yijingorienta.com.br/es/hXX_Elisabete.html (español)

## FORMATO DE RESPUESTA (JSON OBLIGATORIO)
Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido, sin markdown ni código:

{
  "presente": {
    "numero": Integer,
    "nombre": "String (nombre completo del hexagrama)",
    "icono": "String (emoji único que represente su energía)",
    "mensaje_principal": "String (máx 30 palabras, poético pero claro)",
    "recursos_externos": {
      "fer": "https://www.yijingorienta.com.br/hXX_Jorge.html",
      "ora": "https://www.yijingorienta.com.br/es/hXX_Elisabete.html"
    }
  },
  "transformacion": {
    "lineas_mutantes": [Integer],
    "consejo_mutacion": "String (explicación profunda del cambio)"
  },
  "futuro": {
    "numero": Integer,
    "nombre": "String",
    "mensaje": "String (máx 30 palabras)",
    "icono": "String",
    "recursos_externos": {
      "fer": "https://www.yijingorienta.com.br/hXX_Jorge.html",
      "ora": "https://www.yijingorienta.com.br/es/hXX_Elisabete.html"
    }
  },
  "plan_accion": [
    {
      "paso": 1,
      "titulo": "String (frase corta)",
      "detalle": "String (instrucción práctica)",
      "timing": "String (inmediato, en días, gradual)"
    },
    {
      "paso": 2,
      "titulo": "String",
      "detalle": "String",
      "timing": "String"
    },
    {
      "paso": 3,
      "titulo": "String",
      "detalle": "String",
      "timing": "String"
    }
  ],
  "metadatos": {
    "tono_general": "String (desafiante|armonioso|transformador)",
    "elemento_clave": "String (agua|fuego|tierra|metal|madera)",
    "virtud_recomendada": "String (modestia|perseverancia|receptividad)"
  }
}

**RECORDATORIO:** NO uses ```json ni markdown. SOLO el objeto JSON puro."""


def generate_custom_interpretation(
    question: Optional[str],
    present_hexagram: Dict,
    future_hexagram: Optional[Dict],
    changing_lines: list,
    has_changing_lines: bool,
    throws: list
) -> Dict:
    """
    Genera interpretación usando la configuración personalizada de Gemini del usuario
    """
    
    # Construir valores de líneas (6, 7, 8, 9)
    line_values = [throw['sum'] for throw in throws]
    
    # Construir el texto del contenido
    content_text = f"""CONTEXTO DE LA CONSULTA:
Usuario pregunta: {question if question else "Consulta general sin pregunta específica"}

DATOS DEL TIRADA:
[Hexagrama Presente]
ID: {present_hexagram['number']} - Nombre: {present_hexagram['title']}
Valores de líneas: {line_values}
Juicio: {present_hexagram['judgment']}
Imagen: {present_hexagram['image']}

"""

    if has_changing_lines:
        # Convertir índices 1-based a 0-based para la respuesta
        changing_indices = [line - 1 for line in changing_lines]
        content_text += f"""[Mutación]
Líneas cambiando en posiciones (índices 0-5): {changing_indices}

[Hexagrama Futuro]
ID: {future_hexagram['number']} - Nombre: {future_hexagram['title']}
Juicio: {future_hexagram['judgment']}
Imagen: {future_hexagram['image']}

"""
    else:
        content_text += "[Mutación]\nNo hay líneas mutantes. Situación estable.\n\n"

    content_text += "INSTRUCCIÓN:\nInterpreta esta transición específica y llena el JSON del dashboard."

    # Construir el payload según el formato del usuario
    payload = {
        "system_instruction": {
            "parts": {
                "text": SYSTEM_INSTRUCTION
            }
        },
        "contents": {
            "parts": {
                "text": content_text
            }
        },
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.7
        }
    }

    try:
        # Llamar a la API de Gemini
        response = requests.post(
            GEMINI_ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Extraer el JSON de la respuesta
        # Formato: candidates[0].content.parts[0].text
        interpretation_text = data['candidates'][0]['content']['parts'][0]['text']
        
        # Parsear el JSON
        import json
        interpretation = json.loads(interpretation_text)
        
        return {
            "success": True,
            "interpretation": interpretation,
            "model": "gemini-2.5-flash (Custom Gem)",
            "usage": data.get('usageMetadata', {})
        }
        
    except Exception as e:
        print(f"Error generating interpretation: {str(e)}")
        
        # Fallback básico
        return {
            "success": False,
            "error": str(e),
            "interpretation": {
                "presente": {
                    "numero": present_hexagram['number'],
                    "nombre": present_hexagram['title'],
                    "icono": "🎋",
                    "mensaje_principal": present_hexagram['judgment'][:100]
                },
                "transformacion": {
                    "lineas_mutantes": changing_lines if has_changing_lines else [],
                    "consejo_mutacion": "Error al generar interpretación. Por favor intenta de nuevo." if has_changing_lines else "Situación estable sin cambios."
                },
                "futuro": {
                    "numero": future_hexagram['number'] if future_hexagram else None,
                    "nombre": future_hexagram['title'] if future_hexagram else None,
                    "mensaje": future_hexagram['judgment'][:100] if future_hexagram else None,
                    "icono": "🌟"
                } if future_hexagram else None,
                "plan_accion": [
                    {
                        "paso": 1,
                        "titulo": "Reflexiona",
                        "detalle": "Medita sobre el juicio del hexagrama"
                    },
                    {
                        "paso": 2,
                        "titulo": "Observa",
                        "detalle": "Presta atención a las señales en tu vida"
                    },
                    {
                        "paso": 3,
                        "titulo": "Actúa",
                        "detalle": "Toma acción con sabiduría y paciencia"
                    }
                ]
            }
        }
