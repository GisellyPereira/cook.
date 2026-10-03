import React from 'react';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../theme/tokens';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export default function Icon({
  name,
  size = 20,
  color = colors.text,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} accessible={false} />;
}
