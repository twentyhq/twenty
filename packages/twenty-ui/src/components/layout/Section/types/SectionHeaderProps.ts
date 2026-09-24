import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type HeadingProps } from '@ui/primitives/typography/Heading/types/HeadingProps';

export type SectionHeaderProps = Omit<
  useRender.ComponentProps<'div'>,
  'title' | 'children' | 'color'
> &
  Pick<HeadingProps, 'level' | 'size' | 'color'> & {
    title: ReactNode;
    description?: ReactNode;
    adornment?: ReactNode;
    descriptionLineClamp?: number;
  };
