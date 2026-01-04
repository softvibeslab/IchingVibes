/**
 * Gestor de sensores del dispositivo para física realista
 * Detecta sacudidas con debounce y proporciona entropía para aleatoriedad
 */
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export interface SensorData {
  x: number;
  y: number;
  z: number;
}

export class SensorManager {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private lastAcceleration: SensorData = { x: 0, y: 0, z: 0 };
  private lastGyroscope: SensorData = { x: 0, y: 0, z: 0 };
  
  // Configuración de detección de shake mejorada
  private shakeThreshold = 2.5; // Aumentado para evitar falsos positivos
  private shakeTimeWindow = 500; // Ventana de tiempo entre shakes
  private lastShakeTime = 0;
  private shakeCount = 0;
  private requiredShakes = 2; // Requiere múltiples sacudidas para confirmar
  
  private onShakeCallback: (() => void) | null = null;
  private isRunning: boolean = false;
  
  // Historial de aceleración para calcular varianza
  private accelerationHistory: number[] = [];
  private historyMaxLength = 10;

  /**
   * Iniciar monitoreo de sensores
   */
  async start() {
    if (this.isRunning) return;
    
    try {
      // Configurar actualización
      Accelerometer.setUpdateInterval(50); // 20fps es suficiente para shake
      
      // Suscribirse al acelerómetro
      this.accelerometerSubscription = Accelerometer.addListener((data) => {
        this.lastAcceleration = data;
        this.detectShake(data);
        this.updateHistory(data);
      });

      // Suscribirse al giroscopio (opcional, para entropía adicional)
      try {
        Gyroscope.setUpdateInterval(100);
        this.gyroscopeSubscription = Gyroscope.addListener((data) => {
          this.lastGyroscope = data;
        });
      } catch (e) {
        console.log('Gyroscope not available');
      }

      this.isRunning = true;
      console.log('🎯 Sensor manager started');
    } catch (error) {
      console.error('Error starting sensors:', error);
    }
  }

  /**
   * Detener monitoreo de sensores
   */
  stop() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }
    this.isRunning = false;
    console.log('🛑 Sensor manager stopped');
  }

  /**
   * Actualizar historial de aceleración
   */
  private updateHistory(data: SensorData) {
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    this.accelerationHistory.push(magnitude);
    
    if (this.accelerationHistory.length > this.historyMaxLength) {
      this.accelerationHistory.shift();
    }
  }

  /**
   * Detectar sacudida del dispositivo con debounce mejorado
   */
  private detectShake(data: SensorData) {
    // Calcular magnitud de aceleración (removiendo gravedad ~1g)
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    const acceleration = Math.abs(magnitude - 1); // Restar gravedad aproximada
    
    const currentTime = Date.now();
    
    if (acceleration > this.shakeThreshold) {
      // Verificar si estamos dentro de la ventana de tiempo
      if (currentTime - this.lastShakeTime < this.shakeTimeWindow) {
        this.shakeCount++;
      } else {
        // Nueva secuencia de shake
        this.shakeCount = 1;
      }
      
      this.lastShakeTime = currentTime;
      
      // Si alcanzamos el número requerido de shakes, disparar callback
      if (this.shakeCount >= this.requiredShakes) {
        if (this.onShakeCallback) {
          // Feedback háptico inmediato
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          
          console.log('📳 Shake detected!');
          this.onShakeCallback();
          
          // Reset para evitar múltiples disparos
          this.shakeCount = 0;
          this.lastShakeTime = currentTime + 1000; // Cooldown de 1 segundo
        }
      }
    }
  }

  /**
   * Registrar callback para detectar sacudida
   */
  onShake(callback: () => void) {
    this.onShakeCallback = callback;
  }

  /**
   * Remover callback de shake
   */
  removeShakeCallback() {
    this.onShakeCallback = null;
  }

  /**
   * Obtener entropía del sensor (para aleatoriedad "verdadera")
   * Combina múltiples fuentes para mejor aleatoriedad
   */
  getEntropy(): number {
    const { x, y, z } = this.lastAcceleration;
    const { x: gx, y: gy, z: gz } = this.lastGyroscope;
    
    // Combinar valores de acelerómetro y giroscopio
    const timestamp = Date.now() % 1000 / 1000;
    const accelEntropy = (Math.abs(x) + Math.abs(y) + Math.abs(z)) % 1;
    const gyroEntropy = (Math.abs(gx) + Math.abs(gy) + Math.abs(gz)) % 1;
    
    // Mezclar todas las fuentes
    const entropy = (accelEntropy * 0.4 + gyroEntropy * 0.3 + timestamp * 0.3) % 1;
    
    return entropy;
  }

  /**
   * Obtener intensidad del shake actual (0-1)
   */
  getShakeIntensity(): number {
    if (this.accelerationHistory.length < 2) return 0;
    
    const avg = this.accelerationHistory.reduce((a, b) => a + b, 0) / this.accelerationHistory.length;
    const variance = this.accelerationHistory.reduce((sum, val) => sum + (val - avg) ** 2, 0) / this.accelerationHistory.length;
    
    // Normalizar a 0-1
    return Math.min(Math.sqrt(variance) / 2, 1);
  }

  /**
   * Obtener vector de gravedad actual
   */
  getGravityVector(): SensorData {
    return this.lastAcceleration;
  }

  /**
   * Obtener rotación actual
   */
  getRotation(): SensorData {
    return this.lastGyroscope;
  }

  /**
   * Verificar si los sensores están activos
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

export const sensorManager = new SensorManager();