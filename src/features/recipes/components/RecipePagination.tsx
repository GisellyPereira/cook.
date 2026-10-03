import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../../shared/theme/tokens';

export default function RecipePagination({
  hasNext,
  onNext,
}: {
  hasNext: boolean;
  onNext: () => void;
}) {
  return (
    <View style={styles.container}>
      {!hasNext && (
        <Text style={styles.caption}>Você chegou ao fim destas receitas.</Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          hasNext ? 'Carregar mais' : 'Voltar às primeiras receitas'
        }
        onPress={onNext}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>
          {hasNext ? 'Ver mais' : 'Ver novamente'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, alignItems: 'center', gap: 12 },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    minHeight: 48,
    minWidth: 176,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.medium, color: colors.surface, fontSize: 14 },
  pressed: { opacity: 0.75 },
});
