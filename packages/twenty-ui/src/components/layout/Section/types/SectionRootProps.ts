import { type useRender } from '@base-ui/react/use-render';

import { type HeadingProps } from '@ui/primitives/typography/Heading/types/HeadingProps';

export type SectionRootProps = Omit<useRender.ComponentProps<'div'>, 'color'> &
  Pick<HeadingProps, 'color'> & {
    align?: 'left' | 'center';
    fullWidth?: boolean;
  };
