import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type AlertDialogViewportProps } from '../types/AlertDialogViewportProps';

export const AlertDialogViewport = ({
  className,
  ...props
}: AlertDialogViewportProps) => {
  const direction = useProvidedTextDirection();

  return (
    <AlertDialogPrimitive.Viewport
      dir={direction}
      {...props}
      className={mergeClassNames(styles.viewport, className)}
    />
  );
};
