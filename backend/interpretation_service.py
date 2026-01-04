"""
Servicio de Interpretación Profunda del I Ching usando Gemini
Genera análisis detallados, pasos de acción y recomendaciones personalizadas
"""
import os
import google.generativeai as genai
from typing import Dict, Optional

# Configurar Gemini
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "sk-emergent-f149c6009F204AeE30")
genai.configure(api_key=EMERGENT_LLM_KEY)

# Usar Gemini 1.5 Flash para respuestas rápidas y de calidad
model = genai.GenerativeModel('gemini-1.5-flash')

# Contexto del I Ching basado en el libro de Richard Wilhelm
ICHING_CONTEXT = """
Eres un Maestro del I Ching con profundo conocimiento de la filosofía china y la traducción de Richard Wilhelm.

PRINCIPIOS FUNDAMENTALES:
- El I Ching no es adivinación, sino guía para la acción correcta
- Se basa en la sincronicidad: la conexión entre el momento de la consulta y el hexagrama
- El cambio constante es la única constante
- Las líneas móviles (6 y 9) indican transformación

ESTRUCTURA DE HEXAGRAMAS:
- Cada hexagrama tiene: Juicio (El Juicio) e Imagen (La Imagen)
- Las 6 líneas se leen de abajo hacia arriba
- Líneas móviles: 6 (Yin móvil), 9 (Yang móvil)
- Líneas fijas: 7 (Yang joven), 8 (Yin joven)

FILOSOFÍA:
- El noble (hombre noble) actúa con sabiduría, integridad y consideración
- La modestia y receptividad son virtudes clave
- Actuar en armonía con el momento presente
- El desarrollo interior es fundamental
"""

def generate_deep_interpretation(
    question: Optional[str],
    present_hexagram: Dict,
    future_hexagram: Optional[Dict],
    changing_lines: list,
    has_changing_lines: bool
) -> Dict:
    """
    Genera una interpretación profunda y personalizada usando Gemini
    """
    
    # Construir el prompt para Gemini
    prompt = f"""
{ICHING_CONTEXT}

CONSULTA DEL USUARIO:
Pregunta: {question if question else "Sin pregunta específica - Consulta general"}

HEXAGRAMA PRESENTE:
Número: {present_hexagram['number']}
Nombre: {present_hexagram['title']} ({present_hexagram['chinese']})
Trigramas: Superior = {present_hexagram['trigrams']['upper']}, Inferior = {present_hexagram['trigrams']['lower']}
El Juicio: {present_hexagram['judgment']}
La Imagen: {present_hexagram['image']}

"""

    if has_changing_lines:
        prompt += f"""
LÍNEAS MÓVILES: {', '.join([f'Línea {line}' for line in changing_lines])}
Esto indica TRANSFORMACIÓN en proceso.

HEXAGRAMA FUTURO:
Número: {future_hexagram['number']}
Nombre: {future_hexagram['title']} ({future_hexagram['chinese']})
El Juicio: {future_hexagram['judgment']}
La Imagen: {future_hexagram['image']}
"""
    else:
        prompt += "\nNo hay líneas móviles. La situación es ESTABLE en este momento.\n"

    prompt += """

GENERA UNA INTERPRETACIÓN PROFUNDA EN ESPAÑOL QUE INCLUYA:

1. **TÍTULO IMPACTANTE** (una frase que capture la esencia)

2. **ANÁLISIS DE LA SITUACIÓN ACTUAL** (2-3 párrafos):
   - ¿Qué representa el hexagrama presente en el contexto de la pregunta?
   - ¿Cuáles son las fuerzas en juego?
   - ¿Qué está sucediendo a nivel profundo?

3. **SIGNIFICADO DE LAS LÍNEAS MÓVILES** (si existen):
   - ¿Qué indica cada línea móvil específicamente?
   - ¿Qué transformación está ocurriendo?

4. **PLAN DE ACCIÓN CONCRETO** (4-6 pasos numerados):
   - Acciones específicas y prácticas
   - Actitudes a cultivar
   - Cosas a evitar
   - Timing (cuándo actuar)

5. **CONSEJO DEL SABIO** (1 párrafo):
   - Una reflexión profunda final
   - Perspectiva de largo plazo
   - Conexión con principios universales

6. **RESULTADO ESPERADO** (si hay hexagrama futuro):
   - ¿Hacia dónde se dirige la situación?
   - ¿Qué se manifestará si se sigue el consejo?

IMPORTANTE:
- Usa un tono místico pero accesible
- Sé específico y práctico
- Conecta con la pregunta del usuario
- Usa metáforas de la naturaleza
- Mantén el respeto por la tradición china
- Escribe en ESPAÑOL claro y elegante

FORMATO DE SALIDA (JSON):
{{
    "titulo": "El Camino de...",
    "analisis": "Texto del análisis...",
    "lineas_moviles": "Explicación de líneas móviles..." o null,
    "plan_accion": [
        "Paso 1: ...",
        "Paso 2: ...",
        "Paso 3: ...",
        "Paso 4: ..."
    ],
    "consejo_sabio": "Reflexión final...",
    "resultado_esperado": "Hacia dónde va la situación..." o null,
    "keywords": ["palabra1", "palabra2", "palabra3"]
}}
"""

    try:
        # Generar interpretación con Gemini
        response = model.generate_content(prompt)
        
        # Extraer el JSON de la respuesta
        text = response.text
        
        # Limpiar markdown si existe
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        # Parsear JSON
        import json
        interpretation = json.loads(text)
        
        return {
            "success": True,
            "interpretation": interpretation,
            "model": "gemini-1.5-flash"
        }
        
    except Exception as e:
        # Fallback interpretation si Gemini falla
        return {
            "success": False,
            "error": str(e),
            "interpretation": {
                "titulo": f"El Camino de {present_hexagram['title']}",
                "analisis": f"El hexagrama {present_hexagram['title']} {present_hexagram['chinese']} te invita a reflexionar sobre tu situación actual. {present_hexagram['judgment']}",
                "lineas_moviles": f"Las líneas {', '.join(map(str, changing_lines))} indican transformación." if has_changing_lines else None,
                "plan_accion": [
                    "Reflexiona sobre el juicio del hexagrama",
                    "Observa las señales en tu vida diaria",
                    "Actúa con moderación y sabiduría",
                    "Confía en el proceso de transformación"
                ],
                "consejo_sabio": present_hexagram['image'],
                "resultado_esperado": future_hexagram['judgment'] if future_hexagram else None,
                "keywords": ["reflexión", "sabiduría", "acción"]
            }
        }


def generate_summary(interpretation: Dict, present_hexagram: Dict) -> str:
    """
    Genera un resumen corto para mostrar en cards de historial
    """
    return f"{interpretation.get('titulo', present_hexagram['title'])} - {' - '.join(interpretation.get('keywords', [])[:3])}"
