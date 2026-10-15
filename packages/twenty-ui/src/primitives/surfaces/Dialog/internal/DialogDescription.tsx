import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogDescriptionProps } from '../types/DialogDescriptionProps';

import descriptionStyles from '../DialogDescription.module.scss';

export const DialogDescription = ({
  className,
  ...props
}: DialogDescriptionProps) => (
  <DialogPrimitive.Description
    {...props}
    className={mergeClassNames(
      clsx(styles.description, descriptionStyles.description),
      className,
    )}
  />
);
