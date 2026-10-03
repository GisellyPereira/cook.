import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, fonts } from '../theme/tokens';
import Icon from './Icon';
import IconButton from './IconButton';
export default function SearchInput({
  value,
  onChangeText,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Icon name="search" color={colors.muted} size={18} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        maxLength={80}
        returnKeyType={onSubmit ? 'search' : 'done'}
        onSubmitEditing={onSubmit}
      />
      {!!value && (
        <IconButton
          icon="x"
          label={`Limpar ${placeholder}`}
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.small,
    paddingLeft: 15,
    paddingRight: 5,
    minHeight: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 13,
    minWidth: 0,
    fontFamily: fonts.regular,
  },
});
