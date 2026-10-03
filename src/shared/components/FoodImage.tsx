import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';
import Icon from './Icon';

export default function FoodImage({
  uri,
  label,
  style,
}: {
  uri: string;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return (
    <View style={[styles.container, style]}>
      <Icon name="coffee" size={34} color={colors.muted} />
      {!!uri && !failed && (
        <Image
          accessibilityLabel={label}
          source={{ uri }}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
