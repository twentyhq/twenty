import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogTitleProps } from '../types/DialogTitleProps';

export const DialogTitle = ({ className, ...props }: DialogTitleProps) => (
  <DialogPrimitive.Title
    {...props}
    className={mergeClassNames(styles.title, className)}
  />
);
