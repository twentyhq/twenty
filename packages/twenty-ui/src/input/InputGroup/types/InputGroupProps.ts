import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type InputSize } from '@ui/input/types/InputSize';

export type InputGroupProps = useRender.ComponentProps<'div'> & {
  size?: InputSize;
  startElement?: ReactNode;
  endElement?: ReactNode;
};
