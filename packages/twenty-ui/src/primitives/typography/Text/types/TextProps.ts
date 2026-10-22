import { type useRender } from '@base-ui/react/use-render';

import { type TextTypographyProps } from '../internal/TextTypographyProps';
import { type TextTruncationProps } from '../internal/TextTruncationProps';

export type TextProps = Omit<useRender.ComponentProps<'div'>, 'color'> &
  TextTypographyProps &
  TextTruncationProps;
