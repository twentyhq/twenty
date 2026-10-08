import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogPopupProps } from '../types/DialogPopupProps';

export const DialogPopup = ({
  size = 'md',
  className,
  ...props
}: DialogPopupProps) => {
  const direction = useProvidedTextDirection();

  return (
    <DialogPrimitive.Popup
      dir={direction}
      {...props}
      data-size={size}
      className={mergeClassNames(styles.popup, className)}
    />
  );
};
