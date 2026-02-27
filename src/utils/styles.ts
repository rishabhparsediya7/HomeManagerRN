import {Platform} from 'react-native';

export const fonts = {
  black: Platform.select({ios: 'System', android: 'Inter_18pt-Black'}),
  default: Platform.select({ios: 'System', android: 'Inter_18pt-Regular'}),
  bold: Platform.select({ios: 'System', android: 'Inter_18pt-Bold'}),
  medium: Platform.select({ios: 'System', android: 'Inter_18pt-Medium'}),
  light: Platform.select({ios: 'System', android: 'Inter_18pt-Light'}),
  extraBold: Platform.select({ios: 'System', android: 'Inter_18pt-ExtraBold'}),
  thin: Platform.select({ios: 'System', android: 'Inter_18pt-Thin'}),
  extraLight: Platform.select({
    ios: 'System',
    android: 'Inter_18pt-ExtraLight',
  }),
  semiBold: Platform.select({ios: 'System', android: 'Inter_18pt-SemiBold'}),
};

export const commonStyles = {
  textDefault: {
    fontFamily: fonts.default,
  },
  textBold: {
    fontFamily: fonts.bold,
  },
  textMedium: {
    fontFamily: fonts.medium,
  },
  textLight: {
    fontFamily: fonts.light,
  },
  textExtraBold: {
    fontFamily: fonts.extraBold,
  },
  textThin: {
    fontFamily: fonts.thin,
  },
  textExtraLight: {
    fontFamily: fonts.extraLight,
  },
  textSemiBold: {
    fontFamily: fonts.semiBold,
  },
};
