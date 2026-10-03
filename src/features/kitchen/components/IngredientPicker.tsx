import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useKitchen } from '../context/KitchenProvider';
import {
  resolveIngredient,
  searchIngredients,
} from '../../recipes/domain/ingredients';
import { colors, fonts } from '../../../shared/theme/tokens';
import Button from '../../../shared/components/Button';
import Chip from '../../../shared/components/Chip';
import SearchInput from '../../../shared/components/SearchInput';
import Sheet from '../../../shared/components/Sheet';
export default function IngredientPicker({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const { pantry, toggleIngredient } = useKitchen();
  const ingredients = useMemo(() => searchIngredients(query), [query]);
  const groups = [...new Set(ingredients.map(ingredient => ingredient.group))];
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="O que você tem?"
      subtitle="Selecione os ingredientes da sua cozinha. Pode atualizar quando quiser."
    >
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar ingrediente"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {groups.map(group => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupName}>{group.toUpperCase()}</Text>
            <View style={styles.chips}>
              {ingredients
                .filter(ingredient => ingredient.group === group)
                .map(ingredient => (
                  <Chip
                    key={ingredient.id}
                    label={ingredient.label}
                    selected={pantry.some(item => item.id === ingredient.id)}
                    onPress={() => toggleIngredient(ingredient)}
                  />
                ))}
            </View>
          </View>
        ))}
        {ingredients.length === 0 && (
          <View style={styles.group}>
            <Text style={styles.hint}>
              Fora da nossa lista? Use o nome do ingrediente em inglês, como
              aparece nas receitas da TheMealDB.
            </Text>
            <Chip
              label={query.trim()}
              selected={pantry.some(
                item => item.id === resolveIngredient(query).id,
              )}
              onPress={() => toggleIngredient(resolveIngredient(query))}
            />
          </View>
        )}
      </ScrollView>
      <Button
        label={`Pronto · ${pantry.length} ${
          pantry.length === 1 ? 'ingrediente' : 'ingredientes'
        }`}
        icon="check"
        onPress={onClose}
      />
    </Sheet>
  );
}
const styles = StyleSheet.create({
  list: {
    flexShrink: 1,
    marginVertical: 20,
  },
  listContent: {
    paddingBottom: 10,
    gap: 25,
  },
  group: {
    gap: 12,
  },
  groupName: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 1.7,
    fontFamily: fonts.bold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hint: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
});
