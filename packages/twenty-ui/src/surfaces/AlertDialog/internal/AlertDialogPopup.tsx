import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { useDirection } from '@base-ui/react/direction-provider';

import { useThemeContainer } from '@ui/theme-constants';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../../internal/Dialog.module.scss';
import { type AlertDialogPopupProps } from '../types/AlertDialogPopupProps';

export const AlertDialogPopup = ({
  size = 'md',
  container,
  keepMounted,
  className,
  ...props
}: AlertDialogPopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useDirection();

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
