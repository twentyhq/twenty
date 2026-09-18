import { type Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { type HeadingProps } from '@ui/primitives/typography/Heading/types/HeadingProps';

export type DialogTitleProps = Omit<DialogPrimitive.Title.Props, 'color'> &
  Pick<HeadingProps, 'level' | 'size' | 'color'>;
