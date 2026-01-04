import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coin } from '../../components/Coin';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { throwCoins, processThrow, buildHexagram, CoinThrow } from '../../utils/ichingCalculator';
import { sensorManager } from '../../utils/sensorManager';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OracleScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [currentThrow, setCurrentThrow] = useState<number>(0);
  const [throws, setThrows] = useState<CoinThrow[]>([]);
  const [coinValues, setCoinValues] = useState<number[]>([2, 2, 2]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [question, setQuestion] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shakeIndicator, setShakeIndicator] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => {
      sensorManager.stop();
      sensorManager.removeShakeCallback();
    };
  }, []);

  // Actualizar el callback de shake cuando cambian las dependencias
  useEffect(() => {
    if (permissionGranted) {
      sensorManager.onShake(() => {
        if (!isAnimating && currentThrow < 6) {
          // Mostrar indicador visual
          setShakeIndicator(true);
          setTimeout(() => setShakeIndicator(false), 500);
          handleThrowCoins();
        }
      });
    }
  }, [permissionGranted, isAnimating, currentThrow]);

  const requestPermissions = async () => {
    try {
      // En web, los sensores pueden no estar disponibles
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        await sensorManager.start();
        console.log('✅ Sensor permissions granted');
      } else {
        // En web, permitir uso sin sensores (solo botón)
        console.log('⚠️ Sensor permissions not granted, button-only mode');
        setPermissionGranted(true); // Permitir uso sin sensores
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // En caso de error, permitir uso sin sensores
      setPermissionGranted(true);
    }
  };

  const handleThrowCoins = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    
    // Feedback háptico inmediato
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      console.log('Haptics not available');
    }

    // Obtener entropía del sensor (o usar random si no hay sensores)
    const entropy = sensorManager.isActive() 
      ? sensorManager.getEntropy() 
      : Math.random();
    
    // Lanzar monedas
    const coins = throwCoins(entropy);
    setCoinValues(coins);

    // Procesar tirada después de la animación (1.2 segundos)
    setTimeout(() => {
      const throw_result = processThrow(coins);
      const newThrows = [...throws, throw_result];
      setThrows(newThrows);
      setCurrentThrow(currentThrow + 1);
      setIsAnimating(false);

      // Feedback háptico de éxito
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.log('Haptics not available');
      }

      // Si completamos las 6 tiradas
      if (newThrows.length === 6) {
        handleComplete(newThrows);
      }
    }, 1200);
  };

  const handleComplete = (finalThrows: CoinThrow[]) => {
    const hexagramResult = buildHexagram(finalThrows);
    setResult(hexagramResult);
    setShowResult(true);
  };

  const handleSaveReading = async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question || null,
          throws: result.throws,
          present_hexagram: result.present_hexagram,
          future_hexagram: result.future_hexagram,
          has_changing_lines: result.has_changing_lines,
          changing_lines: result.changing_lines,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la lectura');
      }

      const data = await response.json();

      Alert.alert(
        'Guardado',
        'Tu consulta ha sido guardada exitosamente',
        [
          {
            text: 'Ver Interpretación',
            onPress: () => {
              router.push({
                pathname: '/(tabs)/interpretation',
                params: { readingId: data.id },
              });
            },
          },
          {
            text: 'Nueva Consulta',
            onPress: handleReset,
          },
        ]
      );
    } catch (error) {
      console.error('Error saving reading:', error);
      Alert.alert('Error', 'No se pudo guardar la lectura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCurrentThrow(0);
    setThrows([]);
    setCoinValues([2, 2, 2]);
    setQuestion('');
    setShowResult(false);
    setResult(null);
  };

  const getCoinPosition = (index: number) => {
    const spacing = 80;
    const startX = (width - spacing * 2) / 2;
    return {
      x: startX + index * spacing - 30,
      y: height * 0.4,
    };
  };

  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Se requieren permisos de sensores para usar la app
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermissions}>
            <Text style={styles.buttonText}>Otorgar Permisos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult && result) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Tu Hexagrama</Text>
            
            {question && (
              <View style={styles.questionBox}>
                <Text style={styles.questionLabel}>Tu pregunta:</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            )}

            <View style={styles.hexagramSection}>
              <Text style={styles.hexagramLabel}>Presente</Text>
              <HexagramDisplay
                lines={result.throws.map((t: CoinThrow) => t.line_value)}
                changingLines={result.changing_lines}
                size="large"
              />
              <Text style={styles.hexagramNumber}>Hexagrama #{result.present_hexagram}</Text>
            </View>

            {result.has_changing_lines && result.future_hexagram && (
              <View style={styles.hexagramSection}>
                <Text style={styles.hexagramLabel}>Futuro</Text>
                <HexagramDisplay
                  lines={result.throws.map((t: CoinThrow, i: number) => {
                    if (result.changing_lines.includes(i + 1)) {
                      return t.line_value === 0 ? 1 : 0;
                    }
                    return t.line_value;
                  })}
                  size="large"
                />
                <Text style={styles.hexagramNumber}>Hexagrama #{result.future_hexagram}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleReset}
                disabled={isSaving}
              >
                <Text style={styles.buttonTextSecondary}>Nueva Consulta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isSaving && styles.buttonDisabled]}
                onPress={handleSaveReading}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#1a1a2e" />
                ) : (
                  <Text style={styles.buttonText}>Guardar e Interpretar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Oráculo I Ching</Text>
            <Text style={styles.subtitle}>
              Tirada {currentThrow + 1} de 6
            </Text>
          </View>

          {/* Pregunta */}
          {currentThrow === 0 && (
            <View style={styles.questionContainer}>
              <Text style={styles.label}>¿Qué deseas consultar? (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu pregunta..."
                placeholderTextColor="#666"
                value={question}
                onChangeText={setQuestion}
                multiline
                editable={!isAnimating}
              />
            </View>
          )}

          {/* Líneas del hexagrama en construcción */}
          {throws.length > 0 && (
            <View style={styles.progressContainer}>
              <HexagramDisplay
                lines={[...throws.map(t => t.line_value), ...Array(6 - throws.length).fill(0)]}
                changingLines={throws
                  .map((t, i) => (t.line_type.includes('movil') ? i + 1 : -1))
                  .filter(i => i > 0)}
                size="small"
              />
            </View>
          )}

          {/* Área de monedas */}
          <View style={styles.coinArea}>
            {/* Indicador de shake */}
            <View style={[
              styles.shakeIndicator,
              shakeIndicator && styles.shakeIndicatorActive,
            ]}>
              <Text style={styles.instructionText}>
                {isAnimating
                  ? '✨ Lanzando monedas...'
                  : currentThrow >= 6
                    ? '🎋 Hexagrama completado'
                    : '📳 Sacude tu dispositivo o toca el botón'}
              </Text>
            </View>

            {/* Monedas */}
            {coinValues.map((value, index) => (
              <Coin
                key={`coin-${currentThrow}-${index}`}
                value={value}
                index={index}
                position={getCoinPosition(index)}
                isAnimating={isAnimating}
              />
            ))}
          </View>

          {/* Botón de lanzar */}
          <TouchableOpacity
            style={[
              styles.throwButton,
              (isAnimating || currentThrow >= 6) && styles.throwButtonDisabled,
              shakeIndicator && styles.throwButtonShaking,
            ]}
            onPress={handleThrowCoins}
            disabled={isAnimating || currentThrow >= 6}
            activeOpacity={0.7}
          >
            <Text style={styles.throwButtonText}>
              {isAnimating 
                ? '⏳ Lanzando...' 
                : currentThrow >= 6 
                  ? '✅ Completado' 
                  : '🪙 Lanzar Monedas'}
            </Text>
          </TouchableOpacity>

          {/* Historial de tiradas */}
          {throws.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Historial</Text>
              {throws.map((throw_item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyNumber}>{index + 1}.</Text>
                  <View style={styles.historyCoins}>
                    {throw_item.coins.map((coin, i) => (
                      <View
                        key={i}
                        style={[
                          styles.historyCoin,
                          coin === 3 ? styles.historyCoinYang : styles.historyCoinYin,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.historySum}>= {throw_item.sum}</Text>
                  <Text style={[
                    styles.historyType,
                    throw_item.line_type.includes('movil') && styles.historyTypeChanging
                  ]}>
                    {throw_item.line_type.includes('yang') ? 'Yang' : 'Yin'}
                    {throw_item.line_type.includes('movil') && ' *'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0e17',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  questionContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coinArea: {
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  instructionText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 100,
  },
  throwButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginVertical: 16,
  },
  throwButtonDisabled: {
    opacity: 0.5,
  },
  throwButtonShaking: {
    backgroundColor: '#FFE55C',
    transform: [{ scale: 1.02 }],
  },
  throwButtonText: {
    color: '#0f0e17',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shakeIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  shakeIndicatorActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: '#FFD700',
  },
  historyContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  historyTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  historyNumber: {
    color: '#999',
    fontSize: 14,
    width: 24,
  },
  historyCoins: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 12,
  },
  historyCoin: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  historyCoinYang: {
    backgroundColor: '#D4AF37',
  },
  historyCoinYin: {
    backgroundColor: '#8B7355',
  },
  historySum: {
    color: '#CCC',
    fontSize: 14,
    marginHorizontal: 12,
    width: 40,
  },
  historyType: {
    color: '#999',
    fontSize: 14,
    flex: 1,
  },
  historyTypeChanging: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 24,
  },
  questionBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  questionLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
  },
  hexagramSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
  },
  hexagramLabel: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hexagramNumber: {
    color: '#999',
    fontSize: 14,
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0f0e17',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
