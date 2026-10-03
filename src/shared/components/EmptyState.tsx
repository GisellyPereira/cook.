import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import Button from './Button';
import Icon, { IconName } from './Icon';
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Icon name={icon} color={colors.primary} size={27} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && <Button {...action} variant="secondary" />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 330,
    fontFamily: fonts.regular,
  },
});
