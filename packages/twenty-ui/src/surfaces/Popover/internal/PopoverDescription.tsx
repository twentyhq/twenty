import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Popover.module.scss';
import { type PopoverDescriptionProps } from '../types/PopoverDescriptionProps';

export const PopoverDescription = ({
  className,
  ...props
}: PopoverDescriptionProps) => (
  <PopoverPrimitive.Description
    {...props}
    className={mergeFieldPartClassName(styles.description, className)}
  />
);
