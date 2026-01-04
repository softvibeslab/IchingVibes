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
  value: number; // 2 (cruz) o 3 (cara)
  index: number;
  position: { x: number; y: number };
  isAnimating: boolean;
}

const { width } = Dimensions.get('window');
const COIN_SIZE = 60;

export const Coin: React.FC<CoinProps> = ({ value, index, position, isAnimating }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimating) {
      // Animación de lanzamiento
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Haptic feedback al aterrizar
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
    }
  }, [isAnimating]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
  });

  const isCara = value === 3;

  return (
    <Animated.View
      style={[
        styles.coin,
        {
          left: position.x,
          top: position.y,
          transform: [
            { translateY },
            { rotate },
            { scale: scaleValue },
          ],
        },
      ]}
    >
      <View style={[styles.coinInner, isCara ? styles.cara : styles.cruz]}>
        {/* Agujero central */}
        <View style={styles.hole} />
        
        {/* Símbolo */}
        <View style={styles.symbol}>
          {isCara ? (
            // Yang - sólido
            <View style={styles.yangSymbol} />
          ) : (
            // Yin - partido
            <View style={styles.yinContainer}>
              <View style={styles.yinHalf} />
              <View style={styles.yinHalf} />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
  },
  coinInner: {
    width: '100%',
    height: '100%',
    borderRadius: COIN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  cara: {
    backgroundColor: '#D4AF37', // Dorado
    borderWidth: 3,
    borderColor: '#B8960F',
  },
  cruz: {
    backgroundColor: '#8B7355', // Bronce
    borderWidth: 3,
    borderColor: '#654321',
  },
  hole: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2C2416',
    borderWidth: 1,
    borderColor: '#000',
  },
  symbol: {
    marginTop: 20,
  },
  yangSymbol: {
    width: 24,
    height: 4,
    backgroundColor: '#8B0000',
    borderRadius: 2,
  },
  yinContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  yinHalf: {
    width: 10,
    height: 4,
    backgroundColor: '#00008B',
    borderRadius: 2,
  },
});