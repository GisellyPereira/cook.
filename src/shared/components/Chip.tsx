import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, fonts } from '../theme/tokens';
import Icon from './Icon';
export default function Chip({
  label,
  onPress,
  selected = false,
  removable = false,
  count,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  removable?: boolean;
  count?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={removable ? `Remover ${label}` : label}
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {selected && !removable && (
        <Icon name="check" size={13} color={colors.surface} />
      )}
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
        {count !== undefined ? `  ${count}` : ''}
      </Text>
      {removable && (
        <Icon
          name="x"
          size={13}
          color={selected ? colors.surface : colors.muted}
        />
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  chip: {
    maxWidth: '100%',
    minHeight: 40,
    borderRadius: radius.pill,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    flexShrink: 1,
    fontFamily: fonts.bold,
  },
  selectedLabel: {
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
