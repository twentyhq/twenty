import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverDescriptionProps } from '../types/PopoverDescriptionProps';

export const PopoverDescription = ({
  className,
  ...props
}: PopoverDescriptionProps) => (
  <PopoverPrimitive.Description
    {...props}
    className={mergeClassNames(styles.description, className)}
  />
);
