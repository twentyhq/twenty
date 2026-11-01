import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogBackdropProps } from '../types/DialogBackdropProps';

export const DialogBackdrop = ({
  className,
  ...props
}: DialogBackdropProps) => (
  <DialogPrimitive.Backdrop
    {...props}
    className={mergeClassNames(styles.backdrop, className)}
  />
);
