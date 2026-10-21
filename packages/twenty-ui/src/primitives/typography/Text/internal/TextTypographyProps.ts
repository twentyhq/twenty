import { type TypographyColor } from '../../internal/TypographyColor';
import { type TypographyFontSize } from '../../internal/TypographyFontSize';

export type TextTypographyProps = {
  size?: TypographyFontSize;
  weight?: 'regular' | 'medium' | 'semibold';
  color?: TypographyColor;
};
