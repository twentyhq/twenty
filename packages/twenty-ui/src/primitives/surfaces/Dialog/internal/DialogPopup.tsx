import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { isBoolean } from '@sniptt/guards';
import { useDirection } from '@base-ui/react/direction-provider';

import { useThemeContainer } from '@ui/theme-constants';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '@ui/primitives/surfaces/internal/Dialog.module.scss';
import { type DialogPopupProps } from '../types/DialogPopupProps';

export const DialogPopup = ({
  size = 'md',
  container,
  keepMounted,
  backdrop = true,
  viewportProps,
  className,
  ...props
}: DialogPopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useDirection();
  const backdropProps = isBoolean(backdrop) ? {} : backdrop;

  return (
    <DialogPrimitive.Portal
      container={
        container === undefined ? (themeContainer ?? undefined) : container
      }
      keepMounted={keepMounted}
    >
      {backdrop !== false && (
        <DialogPrimitive.Backdrop
          {...backdropProps}
          className={mergeClassNames(styles.backdrop, backdropProps.className)}
        />
      )}
      <DialogPrimitive.Viewport
        dir={direction}
        data-backdrop-hidden={backdrop === false}
        {...viewportProps}
        className={mergeClassNames(styles.viewport, viewportProps?.className)}
      >
        <DialogPrimitive.Popup
          {...props}
          data-size={size}
          className={mergeClassNames(styles.popup, className)}
        />
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
};
