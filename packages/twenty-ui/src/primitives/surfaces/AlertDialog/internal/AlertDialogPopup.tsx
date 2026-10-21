import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type AlertDialogPopupProps } from '../types/AlertDialogPopupProps';

export const AlertDialogPopup = ({
  size = 'md',
  className,
  ...props
}: AlertDialogPopupProps) => (
  <AlertDialogPrimitive.Popup
    {...props}
    data-size={size}
    className={mergeClassNames(styles.popup, className)}
  />
);
