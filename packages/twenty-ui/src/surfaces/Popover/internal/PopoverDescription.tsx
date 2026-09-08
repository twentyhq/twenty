import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Popover.module.scss';
import { type PopoverDescriptionProps } from '../types/PopoverDescriptionProps';

export const PopoverDescription = ({
  className,
  ...props
}: PopoverDescriptionProps) => (
  <PopoverPrimitive.Description
    {...props}
    className={mergePartClassName(styles.description, className)}
  />
);
