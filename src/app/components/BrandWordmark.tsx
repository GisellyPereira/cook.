import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../shared/theme/tokens';
export default function BrandWordmark() {
  return (
    <View accessible accessibilityLabel="Cook From This" style={styles.brand}>
      <Text allowFontScaling={false} style={styles.word}>
        cook<Text style={styles.period}>.</Text>
      </Text>
      <Text allowFontScaling={false} style={styles.signature}>
        FROM THIS
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  brand: {
    alignItems: 'flex-start',
  },
  word: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 37,
    lineHeight: 39,
    letterSpacing: -1.7,
  },
  period: {
    color: colors.accent,
  },
  signature: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 8,
    lineHeight: 12,
    letterSpacing: 2.6,
    marginLeft: 3,
  },
});
