import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/Button';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';
import IconButton from '../../../shared/components/IconButton';
import PageHeading from '../../../shared/components/PageHeading';
import Screen from '../../../shared/components/Screen';
import { useKitchen } from '../context/KitchenProvider';
import { colors, radius, fonts } from '../../../shared/theme/tokens';
export default function ShoppingScreen({
  onDiscover,
}: {
  onDiscover: () => void;
}) {
  const { shopping, toggleShopping, removeShopping, movePurchasedToPantry } =
    useKitchen();
  const checked = shopping.filter(item => item.checked).length;
  return (
    <Screen>
      <PageHeading
        eyebrow="Só o que falta"
        title={'Uma lista.\nMais possibilidades.'}
        description="Complete sua cozinha para preparar as receitas que você escolheu."
      />
      {shopping.length ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {checked} de {shopping.length} itens comprados
            </Text>
            <Text style={styles.number}>
              {shopping.length - checked} faltam
            </Text>
          </View>
          <View style={styles.list}>
            {shopping.map(item => (
              <View key={item.id} style={styles.row}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Comprado: ${item.label}`}
                  accessibilityState={{
                    checked: item.checked,
                  }}
                  onPress={() => toggleShopping(item.id)}
                  style={styles.checkArea}
                >
                  <View
                    style={[styles.checkbox, item.checked && styles.checked]}
                  >
                    {item.checked && (
                      <Icon name="check" size={15} color={colors.surface} />
                    )}
                  </View>
                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemName,
                        item.checked && styles.checkedText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.recipeName} numberOfLines={2}>
                      {item.recipes.join(' · ')}
                    </Text>
                  </View>
                </Pressable>
                <IconButton
                  icon="trash-2"
                  label={`Remover compra ${item.label}`}
                  onPress={() => removeShopping(item.id)}
                />
              </View>
            ))}
          </View>
          <Button
            label="Guardar comprados na cozinha"
            icon="box"
            disabled={checked === 0}
            onPress={movePurchasedToPantry}
          />
          <Text style={styles.note}>
            Os itens marcados vão para sua despensa e saem desta lista. Consulte
            as quantidades no preparo de cada receita.
          </Text>
        </>
      ) : (
        <EmptyState
          icon="shopping-bag"
          title="Por enquanto, está tudo certo"
          description="Abra uma receita e toque em “Adicionar o que falta”. Sua lista reúne os ingredientes sem repetir itens."
          action={{
            label: 'Escolher uma receita',
            onPress: onDiscover,
          }}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    padding: 20,
    borderRadius: radius.medium,
    backgroundColor: colors.primarySoft,
  },
  summaryText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  number: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  list: {
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  checkArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 6,
    minHeight: 56,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemContent: {
    flex: 1,
    gap: 5,
  },
  itemName: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  recipeName: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: fonts.regular,
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});
