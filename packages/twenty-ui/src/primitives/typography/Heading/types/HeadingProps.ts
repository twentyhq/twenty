import { type useRender } from '@base-ui/react/use-render';

import { type TypographyColor } from '../../internal/TypographyColor';
import { type TypographyFontSize } from '../../internal/TypographyFontSize';

export type HeadingProps = Omit<useRender.ComponentProps<'h2'>, 'color'> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: Exclude<TypographyFontSize, 'xxs'>;
  color?: Exclude<TypographyColor, 'light'>;
};
