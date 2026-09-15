import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type InputSize } from '@ui/input/types/InputSize';

export type InputGroupProps = useRender.ComponentProps<'div'> & {
  /** Visual size of the group and its input. */
  size?: InputSize;
  /** Content rendered before the input, such as a prefix or an icon. */
  startElement?: ReactNode;
  /** Content rendered after the input, such as a suffix or a button. */
  endElement?: ReactNode;
};
