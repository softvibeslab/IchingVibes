import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function InterpretationScreen() {
  const router = useRouter();
  const { readingId } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </SafeAreaView>
    );
  }

  if (!reading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
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
          {/* Pregunta */}
          {question && (
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Tu consulta:</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          )}

          {/* Hexagrama Presente */}
          <View style={styles.hexagramSection}>
            <Text style={styles.sectionTitle}>Situación Presente</Text>
            
            <View style={styles.hexagramHeader}>
              <HexagramDisplay
                lines={present_hexagram.lines}
                changingLines={reading.changing_lines}
                size="large"
              />
            </View>

            <Text style={styles.hexagramTitle}>{present_hexagram.title}</Text>
            <Text style={styles.hexagramChinese}>{present_hexagram.chinese}</Text>
            <Text style={styles.hexagramNumber}>Hexagrama #{present_hexagram.number}</Text>

            <View style={styles.textSection}>
              <Text style={styles.textLabel}>El Juicio:</Text>
              <Text style={styles.textContent}>{present_hexagram.judgment}</Text>
            </View>

            <View style={styles.textSection}>
              <Text style={styles.textLabel}>La Imagen:</Text>
              <Text style={styles.textContent}>{present_hexagram.image}</Text>
            </View>
          </View>

          {/* Hexagrama Futuro */}
          {has_changing_lines && future_hexagram && (
            <View style={styles.hexagramSection}>
              <Text style={styles.sectionTitle}>Desarrollo Futuro</Text>
              
              <View style={styles.hexagramHeader}>
                <HexagramDisplay
                  lines={future_hexagram.lines}
                  size="large"
                />
              </View>

              <Text style={styles.hexagramTitle}>{future_hexagram.title}</Text>
              <Text style={styles.hexagramChinese}>{future_hexagram.chinese}</Text>
              <Text style={styles.hexagramNumber}>Hexagrama #{future_hexagram.number}</Text>

              <View style={styles.textSection}>
                <Text style={styles.textLabel}>El Juicio:</Text>
                <Text style={styles.textContent}>{future_hexagram.judgment}</Text>
              </View>

              <View style={styles.textSection}>
                <Text style={styles.textLabel}>La Imagen:</Text>
                <Text style={styles.textContent}>{future_hexagram.image}</Text>
              </View>
            </View>
          )}

          {/* Nota sobre líneas móviles */}
          {has_changing_lines && (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Líneas Móviles</Text>
              <Text style={styles.noteText}>
                Las líneas marcadas con ● son líneas móviles (Yin Móvil o Yang Móvil). 
                Estas indican que la situación está en proceso de transformación hacia el hexagrama futuro.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/history')}
          >
            <Text style={styles.backButtonText}>Ver Historial</Text>
          </TouchableOpacity>
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
  questionBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  questionLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  hexagramSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 24,
  },
  hexagramHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hexagramTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  hexagramChinese: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  hexagramNumber: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  textSection: {
    marginBottom: 20,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  textContent: {
    fontSize: 15,
    color: '#CCC',
    lineHeight: 24,
  },
  noteBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#CCC',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#0f0e17',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});