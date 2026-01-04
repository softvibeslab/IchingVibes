/**
 * Gestor de sensores del dispositivo para física realista
 */
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

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
  private shakeThreshold = 1.5;
  private onShakeCallback: (() => void) | null = null;

  /**
   * Iniciar monitoreo de sensores
   */
  async start() {
    // Configurar actualización rápida
    Accelerometer.setUpdateInterval(16); // ~60fps
    Gyroscope.setUpdateInterval(16);

    // Suscribirse al acelerómetro
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.lastAcceleration = data;
      this.detectShake(data);
    });

    // Suscribirse al giroscopio
    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.lastGyroscope = data;
    });
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
  }

  /**
   * Detectar sacudida del dispositivo
   */
  private detectShake(data: SensorData) {
    const acceleration = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    if (acceleration > this.shakeThreshold) {
      if (this.onShakeCallback) {
        this.onShakeCallback();
        // Feedback háptico
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
   * Obtener entropía del sensor (para aleatoriedad "verdadera")
   */
  getEntropy(): number {
    const { x, y, z } = this.lastAcceleration;
    // Usar decimales de la aceleración como fuente de entropía
    const entropy = (Math.abs(x) + Math.abs(y) + Math.abs(z)) % 1;
    return entropy;
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
}

export const sensorManager = new SensorManager();