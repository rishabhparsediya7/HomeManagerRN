import { COLORS } from '../providers/theme.style';

export const getBGColor = (type: string | undefined) => {
  if (!type) return '';
  const types = ['lent', 'borrowed', 'settled', 'primary', 'secondary', 'dark'];
  const colors = [
    COLORS.primary,
    COLORS.orange,
    COLORS.green100,
    COLORS.primary,
    COLORS.secondary,
    COLORS.dark100,
  ];

  const index = types.findIndex((t) => t === type);
  return colors[index];
};
