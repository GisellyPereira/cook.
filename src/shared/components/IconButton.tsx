import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';
import Icon, { IconName } from './Icon';

export default function IconButton({
  icon,
  label,
  onPress,
  active = false,
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        active && styles.active,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon
        name={icon}
        size={20}
        color={active ? colors.accent : colors.text}
      />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.accentSoft },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.3 },
});
