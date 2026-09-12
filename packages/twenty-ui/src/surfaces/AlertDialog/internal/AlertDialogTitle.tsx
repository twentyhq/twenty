import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogTitleProps } from '../types/AlertDialogTitleProps';

export const AlertDialogTitle = ({
  className,
  ...props
}: AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title
    {...props}
    className={mergeClassNames(styles.title, className)}
  />
);
