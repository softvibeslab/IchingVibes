import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { HexagramDisplay } from '../../components/HexagramDisplay';
import { useRouter } from 'expo-router';

interface Reading {
  id: string;
  question?: string;
  present_hexagram: any;
  future_hexagram?: any;
  has_changing_lines: boolean;
  created_at: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/readings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReadings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Reading }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(tabs)/interpretation?readingId=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.hexagramPreview}>
          <HexagramDisplay
            lines={item.present_hexagram.lines}
            size="small"
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.present_hexagram.title}</Text>
          <Text style={styles.cardSubtitle}>{item.present_hexagram.chinese}</Text>
          {item.has_changing_lines && (
            <Text style={styles.changingLabel}>→ {item.future_hexagram?.title}</Text>
          )}
        </View>
      </View>

      {item.question && (
        <Text style={styles.questionText} numberOfLines={2}>
          {item.question}
        </Text>
      )}

      <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </SafeAreaView>
    );
  }

  if (readings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aún no tienes consultas</Text>
          <Text style={styles.emptySubtext}>
            Realiza tu primera tirada en la pestaña Oráculo
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Consultas</Text>
        <Text style={styles.subtitle}>{readings.length} consultas</Text>
      </View>

      <FlatList
        data={readings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
      />
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
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hexagramPreview: {
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  changingLabel: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});