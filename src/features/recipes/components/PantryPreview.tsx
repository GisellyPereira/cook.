import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useKitchen } from '../../kitchen/context/KitchenProvider';
import { Ingredient } from '../domain/models';
import { colors, fonts, radius } from '../../../shared/theme/tokens';
import Chip from '../../../shared/components/Chip';
import Icon from '../../../shared/components/Icon';
import IconButton from '../../../shared/components/IconButton';

export default function PantryPreview({
  mainIngredient,
  onSelect,
  onAdd,
  onFind,
}: {
  mainIngredient?: Ingredient;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onFind: () => void;
}) {
  const { pantry } = useKitchen();
  if (!pantry.length) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Montar minha cozinha"
        onPress={onAdd}
        style={({ pressed }) => [styles.invitation, pressed && styles.pressed]}
      >
        <Icon name="box" size={22} color={colors.primary} />
        <View style={styles.invitationCopy}>
          <Text style={styles.title}>Cozinhe com o que tem</Text>
          <Text style={styles.hint}>
            Adicione os ingredientes da sua cozinha.
          </Text>
        </View>
        <Icon name="arrow-right" size={18} color={colors.primary} />
      </Pressable>
    );
  }
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <Text style={styles.title}>
          Na minha cozinha<Text style={styles.count}> · {pantry.length}</Text>
        </Text>
        <IconButton
          icon="plus"
          label="Adicionar ingredientes"
          onPress={onAdd}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Encontrar receitas"
          onPress={onFind}
          style={({ pressed }) => [styles.find, pressed && styles.pressed]}
        >
          <Icon name="search" size={14} color={colors.surface} />
          <Text style={styles.findText}>Buscar</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {pantry.map(ingredient => (
          <Chip
            key={ingredient.id}
            label={ingredient.label}
            selected={mainIngredient?.id === ingredient.id}
            onPress={() => onSelect(ingredient.id)}
          />
        ))}
      </ScrollView>
      <Text style={styles.hint}>
        Escolha o ingrediente principal. Comparamos com toda a sua cozinha.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  section: { gap: 9, paddingVertical: 4 },
  invitation: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 17,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.medium,
    minHeight: 78,
  },
  invitationCopy: { flex: 1, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  count: { fontFamily: fonts.regular, color: colors.muted, fontSize: 12 },
  find: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    minHeight: 44,
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingHorizontal: 13,
  },
  findText: { fontFamily: fonts.medium, color: colors.surface, fontSize: 12 },
  chips: { gap: 7, paddingRight: 4 },
  hint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
  },
  pressed: { opacity: 0.65 },
});
