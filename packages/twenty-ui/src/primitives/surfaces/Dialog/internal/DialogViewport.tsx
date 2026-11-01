import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogViewportProps } from '../types/DialogViewportProps';

export const DialogViewport = ({
  className,
  ...props
}: DialogViewportProps) => {
  const direction = useProvidedTextDirection();

  return (
    <DialogPrimitive.Viewport
      dir={direction}
      {...props}
      className={mergeClassNames(styles.viewport, className)}
    />
  );
};
