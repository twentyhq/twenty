import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverArrowProps } from '../types/PopoverArrowProps';

export const PopoverArrow = ({ className, ...props }: PopoverArrowProps) => (
  <PopoverPrimitive.Arrow
    {...props}
    className={mergeClassNames(styles.arrow, className)}
  />
);
