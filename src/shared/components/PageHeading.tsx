import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
export default function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingTop: 8,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 2.3,
    fontFamily: fonts.bold,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1.2,
    fontFamily: fonts.display,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
});
