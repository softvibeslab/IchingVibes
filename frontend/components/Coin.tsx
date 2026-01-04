import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface CoinProps {
  value: number; // 2 (cruz/yin) o 3 (cara/yang)
  index: number;
  position: { x: number; y: number };
  isAnimating: boolean;
}

const { width } = Dimensions.get('window');
const COIN_SIZE = 70;

export const Coin: React.FC<CoinProps> = ({ value, index, position, isAnimating }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimating) {
      // Resetear valores
      translateY.setValue(0);
      translateX.setValue(0);
      rotateX.setValue(0);
      rotateZ.setValue(0);
      scale.setValue(1);
      opacity.setValue(1);

      // Variaciones aleatorias para cada moneda
      const randomXOffset = (Math.random() - 0.5) * 60;
      const randomRotations = 3 + Math.random() * 2; // 3-5 rotaciones
      const randomDelay = index * 100; // Delay escalonado

      // Animación de lanzamiento mejorada
      Animated.sequence([
        Animated.delay(randomDelay),
        Animated.parallel([
          // Movimiento vertical (lanzar hacia arriba y caer)
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -200 - Math.random() * 50, // Altura variable
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 20, // Pequeño rebote
              duration: 500,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // Movimiento horizontal (dispersión)
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: randomXOffset,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 500,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // Rotación 3D simulada (flip de moneda)
          Animated.timing(rotateX, {
            toValue: randomRotations,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Rotación en Z (giro lateral)
          Animated.timing(rotateZ, {
            toValue: (Math.random() - 0.5) * 2,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Escala (perspectiva simulada)
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 0.7,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.15,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Haptic feedback al aterrizar
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
    }
  }, [isAnimating, index]);

  // Interpolaciones
  const rotateXDeg = rotateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateZDeg = rotateZ.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  // Simular efecto 3D con escala basada en rotación
  const scaleY = rotateX.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.1, 1, 0.1, 1],
  });

  const isCara = value === 3;

  return (
    <Animated.View
      style={[
        styles.coinContainer,
        {
          left: position.x,
          top: position.y,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateZDeg },
            { scale },
            { scaleY },
          ],
        },
      ]}
    >
      <View style={[styles.coin, isCara ? styles.cara : styles.cruz]}>
        {/* Borde metálico */}
        <View style={styles.coinBorder}>
          {/* Agujero central (monedas chinas clásicas) */}
          <View style={styles.hole} />
          
          {/* Símbolo Yin/Yang */}
          <View style={styles.symbolContainer}>
            {isCara ? (
              // Yang - línea sólida
              <View style={styles.yangLine} />
            ) : (
              // Yin - línea partida
              <View style={styles.yinContainer}>
                <View style={styles.yinHalf} />
                <View style={styles.yinGap} />
                <View style={styles.yinHalf} />
              </View>
            )}
          </View>

          {/* Caracteres decorativos */}
          <View style={styles.decorTop}>
            <View style={styles.decorDot} />
          </View>
          <View style={styles.decorBottom}>
            <View style={styles.decorDot} />
          </View>
        </View>
      </View>
      
      {/* Sombra */}
      <Animated.View 
        style={[
          styles.shadow,
          {
            opacity: translateY.interpolate({
              inputRange: [-200, 0],
              outputRange: [0.1, 0.4],
            }),
            transform: [{
              scale: translateY.interpolate({
                inputRange: [-200, 0],
                outputRange: [1.5, 1],
              }),
            }],
          }
        ]} 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  coinContainer: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coin: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinBorder: {
    width: COIN_SIZE - 4,
    height: COIN_SIZE - 4,
    borderRadius: (COIN_SIZE - 4) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  cara: {
    backgroundColor: '#D4AF37', // Dorado
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#B8960F',
  },
  cruz: {
    backgroundColor: '#CD7F32', // Bronce
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#8B5A2B',
  },
  hole: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#000',
    // Agujero cuadrado como las monedas chinas
    borderRadius: 2,
  },
  symbolContainer: {
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
  },
  yangLine: {
    width: 20,
    height: 4,
    backgroundColor: '#8B0000',
    borderRadius: 2,
  },
  yinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yinHalf: {
    width: 8,
    height: 4,
    backgroundColor: '#00008B',
    borderRadius: 2,
  },
  yinGap: {
    width: 4,
    height: 4,
  },
  decorTop: {
    position: 'absolute',
    top: 10,
  },
  decorBottom: {
    position: 'absolute',
    bottom: 28,
  },
  decorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shadow: {
    position: 'absolute',
    bottom: -15,
    width: COIN_SIZE * 0.8,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: COIN_SIZE / 2,
  },
});