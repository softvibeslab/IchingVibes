/**
 * Gestor de Audio para efectos de sonido del Oráculo I Ching
 */
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioManager {
  private sounds: { [key: string]: Audio.Sound | null } = {
    coinThrow: null,
    coinLand: null,
    success: null,
    shake: null,
  };
  private isEnabled: boolean = true;
  private isLoaded: boolean = false;

  /**
   * Cargar todos los sonidos de la aplicación
   */
  async loadSounds() {
    if (this.isLoaded) return;

    try {
      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Nota: En producción usaríamos archivos de audio reales
      // Por ahora, usaremos sonidos generados o silencio como placeholder
      this.isLoaded = true;
      console.log('Audio manager initialized');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  /**
   * Reproducir sonido de lanzamiento de monedas
   */
  async playCoinThrow() {
    if (!this.isEnabled) return;
    
    try {
      // Crear un sonido sintético usando vibración corta como feedback
      // En una app real, aquí cargaríamos un archivo .mp3/.wav
      console.log('🎵 Coin throw sound');
    } catch (error) {
      console.error('Error playing coin throw:', error);
    }
  }

  /**
   * Reproducir sonido de moneda aterrizando
   */
  async playCoinLand() {
    if (!this.isEnabled) return;
    
    try {
      console.log('🎵 Coin land sound');
    } catch (error) {
      console.error('Error playing coin land:', error);
    }
  }

  /**
   * Reproducir sonido de éxito (hexagrama completado)
   */
  async playSuccess() {
    if (!this.isEnabled) return;
    
    try {
      console.log('🎵 Success sound');
    } catch (error) {
      console.error('Error playing success:', error);
    }
  }

  /**
   * Reproducir sonido de sacudida detectada
   */
  async playShake() {
    if (!this.isEnabled) return;
    
    try {
      console.log('🎵 Shake detected sound');
    } catch (error) {
      console.error('Error playing shake:', error);
    }
  }

  /**
   * Habilitar/deshabilitar audio
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Verificar si el audio está habilitado
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Liberar recursos de audio
   */
  async unloadSounds() {
    try {
      for (const key in this.sounds) {
        if (this.sounds[key]) {
          await this.sounds[key]?.unloadAsync();
          this.sounds[key] = null;
        }
      }
      this.isLoaded = false;
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }
}

export const audioManager = new AudioManager();
