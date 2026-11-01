import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';

export const PopoverPopup = ({ className, ...props }: PopoverPopupProps) => (
  <PopoverPrimitive.Popup
    {...props}
    className={mergeClassNames(styles.popup, className)}
  />
);
