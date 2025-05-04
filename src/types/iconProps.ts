import {GestureResponderEvent} from 'react-native';

export type IconProps = {
  style?: Object;
  color?: string;
  backgroundColor?: string;
  radius?: string;
  width?: number | string;
  height?: number;
  testID?: string;
  xmlns?: string;
  xmlnsXlink?: string;
  children?: React.ReactNode | Element;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabels?: string;
  disabled?: boolean;
};
