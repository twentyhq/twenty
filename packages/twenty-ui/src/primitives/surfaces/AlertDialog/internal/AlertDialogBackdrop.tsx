import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type AlertDialogBackdropProps } from '../types/AlertDialogBackdropProps';

export const AlertDialogBackdrop = ({
  className,
  ...props
}: AlertDialogBackdropProps) => (
  <AlertDialogPrimitive.Backdrop
    {...props}
    className={mergeClassNames(styles.backdrop, className)}
  />
);
