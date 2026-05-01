import type { SvgProps } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean; // true = active/selected state
  style?: SvgProps['style'];
}
