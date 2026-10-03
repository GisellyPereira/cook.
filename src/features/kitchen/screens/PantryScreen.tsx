import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/Button';
import Chip from '../../../shared/components/Chip';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import PageHeading from '../../../shared/components/PageHeading';
import Screen from '../../../shared/components/Screen';
import { useKitchen } from '../context/KitchenProvider';
import { colors, radius, fonts } from '../../../shared/theme/tokens';
export default function PantryScreen({
  onAddIngredients,
  onDiscover,
}: {
  onAddIngredients: () => void;
  onDiscover: () => void;
}) {
  const { pantry, toggleIngredient } = useKitchen();
  return (
    <Screen>
      <PageHeading
        eyebrow="Seu ponto de partida"
        title={'Minha\ncozinha.'}
        description="O que já está por aqui pode virar seu próximo prato favorito."
      />
      <View style={styles.summary}>
        <View style={styles.icon}>
          <Icon name="box" color={colors.primary} size={25} />
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.number}>
            {pantry.length.toString().padStart(2, '0')}
          </Text>
          <Text style={styles.hint}>ingredientes na sua despensa</Text>
        </View>
        <Icon name="feather" size={28} color={colors.primary} />
      </View>
      <Button
        label="Adicionar ingredientes"
        icon="plus"
        onPress={onAddIngredients}
      />
      {pantry.length ? (
        <>
          <View style={styles.section}>
            <Text style={styles.title}>O que eu tenho</Text>
            <Text style={styles.hint}>
              Toque no × para remover o que acabou.
            </Text>
          </View>
          <View style={styles.chips}>
            {pantry.map(ingredient => (
              <Chip
                key={ingredient.id}
                label={ingredient.label}
                removable
                onPress={() => toggleIngredient(ingredient)}
              />
            ))}
          </View>
          <Button
            label="Descobrir receitas"
            icon="arrow-right"
            onPress={onDiscover}
            variant="secondary"
          />
        </>
      ) : (
        <EmptyState
          icon="sun"
          title="Um ingrediente já é um começo"
          description="Adicione alimentos que você tem em casa. Vamos comparar sua cozinha com os ingredientes de cada receita."
        />
      )}
      <View style={styles.tip}>
        <Icon name="info" color={colors.primary} size={18} />
        <Text style={styles.tipText}>
          Lembre de incluir básicos como sal, azeite e alho. Eles também entram
          na conta. Confira sempre as quantidades na receita.
        </Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  summary: {
    padding: 22,
    borderRadius: radius.medium,
    backgroundColor: colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 54,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  number: {
    color: colors.text,
    fontSize: 30,
    fontFamily: fonts.bold,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: fonts.regular,
  },
  section: {
    gap: 7,
  },
  title: {
    fontSize: 20,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tip: {
    padding: 20,
    borderRadius: radius.medium,
    backgroundColor: colors.cream,
    gap: 12,
    flexDirection: 'row',
  },
  tipText: {
    flex: 1,
    color: colors.primary,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});
