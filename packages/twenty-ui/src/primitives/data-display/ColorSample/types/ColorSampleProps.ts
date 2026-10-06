import { type useRender } from '@base-ui/react/use-render';

import { type ThemeColor } from '@ui/theme';

import { type ColorSampleVariant } from './ColorSampleVariant';

export type ColorSampleProps = useRender.ComponentProps<'div'> & {
  colorName: ThemeColor;
  color?: string;
  variant?: ColorSampleVariant;
};
