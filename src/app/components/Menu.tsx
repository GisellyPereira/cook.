import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppRoute, appRoutes } from '../routes';
import { useKitchen } from '../../features/kitchen/context/KitchenProvider';
import { colors, fonts } from '../../shared/theme/tokens';
import Button from '../../shared/components/Button';
import Icon from '../../shared/components/Icon';
import Sheet from '../../shared/components/Sheet';
export default function Menu({
  visible,
  onClose,
  activeRoute,
  onNavigate,
  onAbout,
}: {
  visible: boolean;
  onClose: () => void;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onAbout: () => void;
}) {
  const { pantry, favorites, shopping } = useKitchen();
  const counts = {
    discover: null,
    pantry: pantry.length,
    favorites: favorites.length,
    shopping: shopping.filter(item => !item.checked).length,
  };
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Sua cozinha, suas ideias."
      subtitle="Cozinhe com o que tem. Descubra o que pode ser."
    >
      <View style={styles.list}>
        {appRoutes.map(route => (
          <Pressable
            key={route.id}
            accessibilityRole="button"
            accessibilityLabel={`Ir para ${route.label}`}
            accessibilityState={{
              selected: route.id === activeRoute,
            }}
            onPress={() => onNavigate(route.id)}
            style={[styles.item, route.id === activeRoute && styles.active]}
          >
            <Icon name={route.icon} />
            <Text style={styles.label}>{route.label}</Text>
            {counts[route.id] !== null && (
              <Text style={styles.count}>{counts[route.id]}</Text>
            )}
            <Icon name="arrow-right" size={17} color={colors.muted} />
          </Pressable>
        ))}
      </View>
      <Button
        label="Sobre o COOK FROM THIS"
        icon="info"
        variant="ghost"
        onPress={onAbout}
      />
    </Sheet>
  );
}
const styles = StyleSheet.create({
  list: {
    gap: 8,
    marginBottom: 16,
  },
  item: {
    minHeight: 56,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  active: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  count: {
    fontSize: 13,
    color: colors.muted,
    fontFamily: fonts.regular,
  },
});
