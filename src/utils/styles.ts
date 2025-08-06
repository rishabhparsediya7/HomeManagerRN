import { COLORS } from '../providers/theme.style';

export const getBGColor = (type: string | undefined) => {
  if (!type) return '';
  const types = ['lent', 'borrowed', 'settled', 'primary', 'secondary', 'dark'];
  const colors = [
    COLORS.primary,
    COLORS.primary,
    COLORS.secondary,
  ];

  const index = types.findIndex((t) => t === type);
  return colors[index];
};

export const fonts={
  black: 'NataSans-Black',
  default: 'NataSans-Regular',
  bold: 'NataSans-Bold',
  medium: 'NataSans-Medium',
  light: 'NataSans-Light',
  extraBold: 'NataSans-ExtraBold',
  thin: 'NataSans-Thin',
  extraLight: 'NataSans-ExtraLight',
  semiBold: 'NataSans-SemiBold',

}