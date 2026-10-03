import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, fonts } from '../theme/tokens';
import Icon, { IconName } from './Icon';
type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};
export default function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  const foreground = variant === 'primary' ? colors.surface : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled: !!disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary'
          ? styles.primary
          : variant === 'secondary'
          ? styles.secondary
          : styles.ghost,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon && <Icon name={icon} color={foreground} size={18} />}
      <Text
        style={[
          styles.label,
          {
            color: foreground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.small,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.75,
  },
});
