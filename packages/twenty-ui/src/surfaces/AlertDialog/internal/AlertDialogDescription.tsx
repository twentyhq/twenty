import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogDescriptionProps } from '../types/AlertDialogDescriptionProps';

export const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description
    {...props}
    className={mergeClassNames(styles.description, className)}
  />
);
