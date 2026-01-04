import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface DeepInterpretation {
  // Formato de la gema personalizada
  presente: {
    numero: number;
    nombre: string;
    icono: string;
    mensaje_principal: string;
  };
  transformacion: {
    lineas_mutantes: number[];
    consejo_mutacion: string;
  };
  futuro?: {
    numero: number;
    nombre: string;
    mensaje: string;
    icono: string;
  };
  plan_accion: Array<{
    paso: number;
    titulo: string;
    detalle: string;
  }>;
}

export default function InterpretationScreen() {
  const router = useRouter();
  const { readingId } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [deepInterpretation, setDeepInterpretation] = useState<DeepInterpretation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInterpretation, setLoadingInterpretation] = useState(false);
  const [showDeepInterpretation, setShowDeepInterpretation] = useState(false);

  useEffect(() => {
    if (readingId) {
      fetchReading();
    }
  }, [readingId]);

  const fetchReading = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/readings/${readingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReading(data);
      }
    } catch (error) {
      console.error('Error fetching reading:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeepInterpretation = async () => {
    setLoadingInterpretation(true);
    setShowDeepInterpretation(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/readings/${readingId}/interpret`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDeepInterpretation(data.interpretation);
      }
    } catch (error) {
      console.error('Error generating interpretation:', error);
    } finally {
      setLoadingInterpretation(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Consultando el oráculo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#FFD700" />
          <Text style={styles.errorText}>No se pudo cargar la lectura</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { present_hexagram, future_hexagram, has_changing_lines, question } = reading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header Místico */}
          <View style={styles.header}>
            <Ionicons name="sparkles" size={32} color="#FFD700" />
            <Text style={styles.headerTitle}>Oráculo de Sincronicidad</Text>
            <View style={styles.dividerGold} />
          </View>

          {/* Pregunta */}
          {question && (
            <View style={styles.questionCard}>
              <Text style={styles.questionLabel}>Tu Consulta:</Text>
              <Text style={styles.questionText}>"{question}"</Text>
            </View>
          )}

          {/* Hexagramas */}
          <View style={styles.hexagramsContainer}>
            <View style={styles.hexagramCard}>
              <Text style={styles.hexagramLabel}>
                <Ionicons name="today" size={16} /> Presente
              </Text>
              <HexagramDisplay
                lines={present_hexagram.lines}
                changingLines={reading.changing_lines}
                size="large"
              />
              <Text style={styles.hexagramTitle}>{present_hexagram.title}</Text>
              <Text style={styles.hexagramChinese}>{present_hexagram.chinese}</Text>
              <Text style={styles.hexagramNumber}>Hexagrama #{present_hexagram.number}</Text>
            </View>

            {has_changing_lines && future_hexagram && (
              <>
                <View style={styles.arrow}>
                  <Ionicons name="arrow-forward" size={32} color="#FFD700" />
                </View>
                <View style={styles.hexagramCard}>
                  <Text style={styles.hexagramLabel}>
                    <Ionicons name="trending-up" size={16} /> Futuro
                  </Text>
                  <HexagramDisplay
                    lines={future_hexagram.lines}
                    size="large"
                  />
                  <Text style={styles.hexagramTitle}>{future_hexagram.title}</Text>
                  <Text style={styles.hexagramChinese}>{future_hexagram.chinese}</Text>
                  <Text style={styles.hexagramNumber}>Hexagrama #{future_hexagram.number}</Text>
                </View>
              </>
            )}
          </View>

          {/* Botón para Interpretación Profunda */}
          {!showDeepInterpretation && (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={generateDeepInterpretation}
            >
              <Ionicons name="bulb" size={24} color="#0f0e17" />
              <Text style={styles.aiButtonText}>Generar Interpretación Profunda con IA</Text>
            </TouchableOpacity>
          )}

          {/* Loading Interpretación */}
          {loadingInterpretation && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingInterpText}>
                Consultando la sabiduría ancestral del I Ching...
              </Text>
              <Text style={styles.loadingSubtext}>Esto puede tomar unos segundos</Text>
            </View>
          )}

          {/* Interpretación Profunda */}
          {deepInterpretation && !loadingInterpretation && (
            <View style={styles.deepInterpretation}>
              {/* Título Impactante */}
              <View style={styles.titleCard}>
                <Text style={styles.deepTitle}>{deepInterpretation.titulo}</Text>
                <View style={styles.keywords}>
                  {deepInterpretation.keywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordBadge}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Análisis */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="eye" size={20} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Análisis de la Situación</Text>
                </View>
                <Text style={styles.analysisText}>{deepInterpretation.analisis}</Text>
              </View>

              {/* Líneas Móviles */}
              {deepInterpretation.lineas_moviles && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="git-network" size={20} color="#FFD700" />
                    <Text style={styles.sectionTitle}>Líneas en Transformación</Text>
                  </View>
                  <View style={styles.movingLinesCard}>
                    <Text style={styles.movingLinesText}>{deepInterpretation.lineas_moviles}</Text>
                  </View>
                </View>
              )}

              {/* Plan de Acción */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={20} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Tu Plan de Acción</Text>
                </View>
                {deepInterpretation.plan_accion.map((step, index) => (
                  <View key={index} style={styles.actionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Consejo del Sabio */}
              <View style={styles.sageAdvice}>
                <View style={styles.sageHeader}>
                  <Ionicons name="leaf" size={24} color="#FFD700" />
                  <Text style={styles.sageTitle}>Consejo del Sabio</Text>
                </View>
                <Text style={styles.sageText}>{deepInterpretation.consejo_sabio}</Text>
              </View>

              {/* Resultado Esperado */}
              {deepInterpretation.resultado_esperado && (
                <View style={styles.futureCard}>
                  <View style={styles.futureHeader}>
                    <Ionicons name="compass" size={20} color="#FFD700" />
                    <Text style={styles.futureTitle}>Hacia Dónde Te Diriges</Text>
                  </View>
                  <Text style={styles.futureText}>{deepInterpretation.resultado_esperado}</Text>
                </View>
              )}
            </View>
          )}

          {/* Interpretación Tradicional (siempre visible) */}
          <View style={styles.traditionalSection}>
            <Text style={styles.traditionalTitle}>Interpretación Tradicional</Text>
            
            <View style={styles.textSection}>
              <Text style={styles.textLabel}>El Juicio:</Text>
              <Text style={styles.textContent}>{present_hexagram.judgment}</Text>
            </View>

            <View style={styles.textSection}>
              <Text style={styles.textLabel}>La Imagen:</Text>
              <Text style={styles.textContent}>{present_hexagram.image}</Text>
            </View>

            {has_changing_lines && future_hexagram && (
              <>
                <View style={styles.divider} />
                <Text style={styles.textLabel}>Hexagrama Futuro - El Juicio:</Text>
                <Text style={styles.textContent}>{future_hexagram.judgment}</Text>
              </>
            )}
          </View>

          {/* Botones de navegación */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)/history')}
            >
              <Ionicons name="time" size={20} color="#FFD700" />
              <Text style={styles.navButtonText}>Ver Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons name="add-circle" size={20} color="#FFD700" />
              <Text style={styles.navButtonText}>Nueva Consulta</Text>
            </TouchableOpacity>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  dividerGold: {
    width: 60,
    height: 3,
    backgroundColor: '#FFD700',
    marginTop: 12,
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  questionLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  hexagramsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  hexagramCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: width * 0.4,
    marginHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  hexagramLabel: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  hexagramTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  hexagramChinese: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  hexagramNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  arrow: {
    marginHorizontal: 8,
  },
  aiButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonText: {
    color: '#0f0e17',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingInterpText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 16,
  },
  deepInterpretation: {
    marginBottom: 24,
  },
  titleCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  deepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keywordBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  keywordText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  analysisText: {
    fontSize: 15,
    color: '#CCC',
    lineHeight: 24,
  },
  movingLinesCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  movingLinesText: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 22,
  },
  actionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#0f0e17',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
  },
  sageAdvice: {
    backgroundColor: 'rgba(139, 111, 93, 0.2)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  sageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  sageText: {
    fontSize: 15,
    color: '#E8DCC4',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  futureCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  futureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  futureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  futureText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
  },
  traditionalSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  traditionalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  textContent: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    marginVertical: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#0f0e17',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
