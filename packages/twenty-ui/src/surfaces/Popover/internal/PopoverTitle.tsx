import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverTitleProps } from '../types/PopoverTitleProps';

export const PopoverTitle = ({ className, ...props }: PopoverTitleProps) => (
  <PopoverPrimitive.Title
    {...props}
    className={mergeClassNames(styles.title, className)}
  />
);
