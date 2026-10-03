import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, radius } from '../../../shared/theme/tokens';

export default function RecipeSkeleton() {
  const { width } = useWindowDimensions();
  const itemWidth = width >= 800 ? '32%' : '48.5%';
  return (
    <View accessibilityLabel="Carregando seis receitas" style={styles.grid}>
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={{ width: itemWidth }}>
          <View style={styles.image} />
          <View style={styles.caption} />
          <View style={styles.title} />
          <View style={styles.subtitle} />
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
  },
  image: {
    aspectRatio: 1.08,
    backgroundColor: colors.cream,
    borderRadius: radius.medium,
  },
  caption: {
    height: 10,
    width: '45%',
    marginTop: 13,
    marginBottom: 8,
    backgroundColor: colors.cream,
    borderRadius: 3,
  },
  title: { height: 40, backgroundColor: colors.cream, borderRadius: 3 },
  subtitle: {
    height: 14,
    width: '65%',
    marginTop: 12,
    backgroundColor: colors.cream,
    borderRadius: 3,
  },
});
