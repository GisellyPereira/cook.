import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppRoute, appRoutes } from '../routes';
import { colors, contentWidth, fonts } from '../../shared/theme/tokens';
import Icon from '../../shared/components/Icon';
export default function BottomNavigation({
  activeRoute,
  onNavigate,
  shoppingCount,
}: {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  shoppingCount: number;
}) {
  const insets = useSafeAreaInsets();
  // Keep room for the home indicator without raising the whole menu by its inset.
  const bottomPadding = Math.max(8, insets.bottom - 16);
  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View style={styles.container}>
        {appRoutes.map(route => {
          const active = activeRoute === route.id;
          return (
            <Pressable
              key={route.id}
              accessibilityRole="tab"
              accessibilityLabel={route.label}
              accessibilityState={{
                selected: active,
              }}
              onPress={() => onNavigate(route.id)}
              style={styles.item}
            >
              <View style={[styles.icon, active && styles.activeIcon]}>
                <Icon
                  name={route.icon}
                  size={20}
                  color={active ? colors.primary : colors.muted}
                />
                {route.id === 'shopping' && shoppingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {shoppingCount > 9 ? '9+' : shoppingCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {route.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: contentWidth,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 48,
  },
  icon: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    includeFontPadding: false,
    fontFamily: fonts.bold,
  },
  activeLabel: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -3,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 8,
    fontFamily: fonts.bold,
  },
});
