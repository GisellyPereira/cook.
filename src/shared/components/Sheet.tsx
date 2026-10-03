import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme/tokens';
import IconButton from './IconButton';
export default function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${title} ao tocar fora`}
          onPress={onClose}
        />
        <SafeAreaView edges={['bottom']} style={styles.panel}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <IconButton icon="x" label={`Fechar ${title}`} onPress={onClose} />
          </View>
          {children}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 30, 21, 0.42)',
  },
  panel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  heading: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontSize: 25,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    fontFamily: fonts.regular,
  },
});
