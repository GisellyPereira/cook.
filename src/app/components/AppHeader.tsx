import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, contentWidth, fonts } from '../../shared/theme/tokens';
import BrandWordmark from './BrandWordmark';
import IconButton from '../../shared/components/IconButton';

export default function AppHeader({
  onOpenMenu,
  onSearch,
  onBack,
  backLabel = 'Voltar às receitas',
}: {
  onOpenMenu: () => void;
  onSearch: () => void;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <View style={styles.back}>
          <IconButton icon="arrow-left" label={backLabel} onPress={onBack} />
          <Text style={styles.recipeLabel}>A RECEITA</Text>
        </View>
      ) : (
        <BrandWordmark />
      )}
      <View style={styles.actions}>
        {!onBack && (
          <IconButton
            icon="search"
            label="Buscar receita pelo nome"
            onPress={onSearch}
          />
        )}
        <IconButton icon="menu" label="Abrir menu" onPress={onOpenMenu} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: contentWidth,
    alignSelf: 'center',
  },
  actions: { flexDirection: 'row', gap: 8 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recipeLabel: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },
});
