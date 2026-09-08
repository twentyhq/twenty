import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Popover.module.scss';
import { type PopoverTitleProps } from '../types/PopoverTitleProps';

export const PopoverTitle = ({ className, ...props }: PopoverTitleProps) => (
  <PopoverPrimitive.Title
    {...props}
    className={mergeFieldPartClassName(styles.title, className)}
  />
);
