import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogDescriptionProps } from '../types/DialogDescriptionProps';

export const DialogDescription = ({
  className,
  ...props
}: DialogDescriptionProps) => (
  <DialogPrimitive.Description
    {...props}
    className={mergeClassNames(styles.description, className)}
  />
);
