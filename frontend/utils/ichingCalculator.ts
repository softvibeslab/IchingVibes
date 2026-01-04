/**
 * Utilidades para cálculo de hexagramas del I Ching
 */

export interface CoinThrow {
  coins: number[]; // [2 o 3, 2 o 3, 2 o 3]
  sum: number; // 6, 7, 8, o 9
  line_type: string; // "yin_fija", "yang_fija", "yin_movil", "yang_movil"
  line_value: number; // 0 (yin) o 1 (yang)
}

/**
 * Simular tirada de 3 monedas usando entropía del acelerómetro
 * @param entropy Valor de entropía del sensor (0-1)
 * @returns Arreglo de 3 valores (2 o 3)
 */
export function throwCoins(entropy: number = Math.random()): number[] {
  const coins: number[] = [];
  
  for (let i = 0; i < 3; i++) {
    // Mezclar entropía con ruido adicional
    const rand = (entropy + Math.random() + Math.random()) / 3;
    // 2 = cruz (yin), 3 = cara (yang)
    coins.push(rand > 0.5 ? 3 : 2);
  }
  
  return coins;
}

/**
 * Procesar tirada de monedas y determinar tipo de línea
 * @param coins Arreglo de 3 valores (2 o 3)
 * @returns Objeto CoinThrow con toda la información
 */
export function processThrow(coins: number[]): CoinThrow {
  const sum = coins.reduce((a, b) => a + b, 0);
  
  let line_type: string;
  let line_value: number;
  
  switch (sum) {
    case 6: // 3 cruces (2+2+2)
      line_type = "yin_movil";
      line_value = 0;
      break;
    case 7: // 2 cruces, 1 cara (2+2+3)
      line_type = "yang_fija";
      line_value = 1;
      break;
    case 8: // 1 cruz, 2 caras (2+3+3)
      line_type = "yin_fija";
      line_value = 0;
      break;
    case 9: // 3 caras (3+3+3)
      line_type = "yang_movil";
      line_value = 1;
      break;
    default:
      line_type = "yin_fija";
      line_value = 0;
  }
  
  return {
    coins,
    sum,
    line_type,
    line_value,
  };
}

/**
 * Calcular número de hexagrama desde líneas
 * @param lines Arreglo de 6 líneas (0 o 1), de abajo hacia arriba
 * @returns Número del hexagrama (1-64)
 */
export function calculateHexagramNumber(lines: number[]): number {
  // Mapeo de hexagramas según Wilhelm/Baynes
  const hexagramTable: { [key: string]: number } = {
    '111111': 1,   // ䷀ Qian - Lo Creativo
    '000000': 2,   // ䷁ Kun - Lo Receptivo
    '010001': 3,   // ䷂ Zhun
    '100010': 4,   // ䷃ Meng
    '010111': 5,   // ䷄ Xu
    '111010': 6,   // ䷅ Song
    '000010': 7,   // ䷆ Shi
    '010000': 8,   // ䷇ Pi
    '110111': 9,   // ䷈ Xiao Chu
    '111011': 10,  // ䷉ Lu
    '000111': 11,  // ䷊ Tai
    '111000': 12,  // ䷋ Pi
    '111101': 13,  // ䷌ Tong Ren
    '101111': 14,  // ䷍ Da You
    '000100': 15,  // ䷎ Qian
    '001000': 16,  // ䷏ Yu
    '011001': 17,  // ䷐ Sui
    '100110': 18,  // ䷑ Gu
    '000011': 19,  // ䷒ Lin
    '110000': 20,  // ䷓ Guan
    '100101': 21,  // ䷔ Shi He
    '101001': 22,  // ䷕ Bi
    '100000': 23,  // ䷖ Bo
    '000001': 24,  // ䷗ Fu
    '111001': 25,  // ䷘ Wu Wang
    '100111': 26,  // ䷙ Da Chu
    '100001': 27,  // ䷚ Yi
    '011110': 28,  // ䷛ Da Guo
    '010010': 29,  // ䷜ Kan
    '101101': 30,  // ䷝ Li
    '011100': 31,  // ䷞ Xian
    '001110': 32,  // ䷟ Heng
    '111100': 33,  // ䷠ Dun
    '001111': 34,  // ䷡ Da Zhuang
    '101000': 35,  // ䷢ Jin
    '000101': 36,  // ䷣ Ming Yi
    '101110': 37,  // ䷤ Jia Ren
    '011010': 38,  // ䷥ Kui
    '010100': 39,  // ䷦ Jian
    '001010': 40,  // ䷧ Xie
    '100011': 41,  // ䷨ Sun
    '110001': 42,  // ䷩ Yi
    '011111': 43,  // ䷪ Guai
    '111110': 44,  // ䷫ Gou
    '011000': 45,  // ䷬ Cui
    '000110': 46,  // ䷭ Sheng
    '011010': 47,  // ䷮ Kun (duplicado, ajustar)
    '010110': 48,  // ䷯ Jing
    '011101': 49,  // ䷰ Ge
    '101011': 50,  // ䷱ Ding
    '001001': 51,  // ䷲ Zhen
    '100100': 52,  // ䷳ Gen
    '110100': 53,  // ䷴ Jian
    '001011': 54,  // ䷵ Gui Mei
    '001101': 55,  // ䷶ Feng
    '101100': 56,  // ䷷ Lu
    '110110': 57,  // ䷸ Xun
    '011011': 58,  // ䷹ Dui
    '110010': 59,  // ䷺ Huan
    '010011': 60,  // ䷻ Jie
    '110011': 61,  // ䷼ Zhong Fu
    '001100': 62,  // ䷽ Xiao Guo
    '010101': 63,  // ䷾ Ji Ji
    '101010': 64,  // ䷿ Wei Ji
  };
  
  const key = lines.join('');
  return hexagramTable[key] || 1;
}

/**
 * Construir hexagrama completo desde 6 tiradas
 * @param throws Arreglo de 6 objetos CoinThrow
 * @returns Información completa del hexagrama presente y futuro
 */
export function buildHexagram(throws: CoinThrow[]) {
  // Líneas del hexagrama presente
  const presentLines = throws.map(t => t.line_value);
  
  // Detectar líneas móviles
  const changingLines: number[] = [];
  const futureLines = presentLines.map((line, index) => {
    const isChanging = throws[index].line_type.includes('movil');
    if (isChanging) {
      changingLines.push(index + 1); // 1-indexed
      return line === 0 ? 1 : 0; // Invertir línea
    }
    return line;
  });
  
  const presentHexagram = calculateHexagramNumber(presentLines);
  const futureHexagram = changingLines.length > 0 
    ? calculateHexagramNumber(futureLines) 
    : null;
  
  return {
    throws,
    present_hexagram: presentHexagram,
    future_hexagram: futureHexagram,
    has_changing_lines: changingLines.length > 0,
    changing_lines: changingLines,
  };
}