import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type AlertDialogPopupProps } from '../types/AlertDialogPopupProps';

export const AlertDialogPopup = ({
  size = 'md',
  container,
  keepMounted,
  className,
  ...props
}: AlertDialogPopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <AlertDialogPrimitive.Portal
      container={
        container === undefined ? (themeContainer ?? undefined) : container
      }
      keepMounted={keepMounted}
    >
      <AlertDialogPrimitive.Backdrop className={styles.backdrop} />
      <AlertDialogPrimitive.Viewport
        dir={direction}
        className={styles.viewport}
      >
        <AlertDialogPrimitive.Popup
          {...props}
          data-size={size}
          className={mergeClassNames(styles.popup, className)}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  );
};
