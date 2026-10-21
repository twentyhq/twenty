import { Select as SelectPrimitive } from '@base-ui/react/select';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectPopupProps } from '../types/SelectPopupProps';

export const SelectPopup = ({ className, ...props }: SelectPopupProps) => (
  <SelectPrimitive.Popup
    {...props}
    className={mergeClassNames(styles.popup, className)}
  />
);
