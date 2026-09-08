import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Popover.module.scss';
import { type PopoverTitleProps } from '../types/PopoverTitleProps';

export const PopoverTitle = ({ className, ...props }: PopoverTitleProps) => (
  <PopoverPrimitive.Title
    {...props}
    className={mergePartClassName(styles.title, className)}
  />
);
