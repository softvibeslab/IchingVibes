import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HexagramDisplayProps {
  lines: number[]; // Array de 6 líneas (0 o 1), de abajo hacia arriba
  changingLines?: number[]; // Líneas que cambian (1-indexed)
  size?: 'small' | 'medium' | 'large';
}

export const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  lines,
  changingLines = [],
  size = 'medium',
}) => {
  const lineHeight = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const lineWidth = size === 'small' ? 60 : size === 'medium' ? 80 : 100;
  const gapSize = lineHeight * 0.6;

  // Invertir para mostrar de arriba hacia abajo
  const displayLines = [...lines].reverse();

  return (
    <View style={styles.container}>
      {displayLines.map((line, index) => {
        const actualIndex = 6 - index; // Convertir a 1-indexed de abajo hacia arriba
        const isChanging = changingLines.includes(actualIndex);
        const isYang = line === 1;

        return (
          <View key={index} style={[styles.lineContainer, { marginBottom: gapSize }]}>
            {isYang ? (
              // Línea Yang (continua)
              <View
                style={[
                  styles.yangLine,
                  {
                    width: lineWidth,
                    height: lineHeight,
                    backgroundColor: isChanging ? '#FFD700' : '#FFFFFF',
                  },
                ]}
              />
            ) : (
              // Línea Yin (partida)
              <View style={[styles.yinLine, { width: lineWidth }]}>
                <View
                  style={[
                    styles.yinHalf,
                    {
                      height: lineHeight,
                      backgroundColor: isChanging ? '#FFD700' : '#FFFFFF',
                    },
                  ]}
                />
                <View
                  style={[
                    styles.yinHalf,
                    {
                      height: lineHeight,
                      backgroundColor: isChanging ? '#FFD700' : '#FFFFFF',
                    },
                  ]}
                />
              </View>
            )}
            {isChanging && (
              <View style={styles.changingIndicator}>
                <Text style={styles.changingText}>●</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  lineContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  yangLine: {
    borderRadius: 2,
  },
  yinLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yinHalf: {
    width: '45%',
    borderRadius: 2,
  },
  changingIndicator: {
    position: 'absolute',
    right: -24,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  changingText: {
    color: '#FFD700',
    fontSize: 12,
  },
});