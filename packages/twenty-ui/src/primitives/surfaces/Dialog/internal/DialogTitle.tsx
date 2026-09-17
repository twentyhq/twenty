import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { Heading } from '@ui/primitives/typography/Heading/Heading';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import { type DialogTitleProps } from '../types/DialogTitleProps';

import styles from '../DialogTitle.module.scss';

export const DialogTitle = ({
  level = 2,
  size = 'lg',
  color = 'primary',
  className,
  render,
  ...props
}: DialogTitleProps) => (
  <DialogPrimitive.Title
    {...props}
    className={mergeClassNames(styles.title, className)}
    render={<Heading level={level} size={size} color={color} render={render} />}
  />
);
