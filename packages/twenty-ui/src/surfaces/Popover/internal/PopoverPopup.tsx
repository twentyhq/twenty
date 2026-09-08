import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { useThemeContainer } from '@ui/theme-constants';
import { mergePartClassName } from '@ui/utilities/internal/mergePartClassName';

import styles from '../Popover.module.scss';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';

export const PopoverPopup = ({
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset,
  arrow = false,
  anchor,
  container,
  keepMounted,
  className,
  children,
  ...props
}: PopoverPopupProps) => {
  const themeContainer = useThemeContainer();

  return (
    <PopoverPrimitive.Portal
      container={container ?? themeContainer ?? undefined}
      keepMounted={keepMounted}
    >
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        className={styles.positioner}
      >
        <PopoverPrimitive.Popup
          {...props}
          className={mergePartClassName(styles.popup, className)}
        >
          {arrow && <PopoverPrimitive.Arrow className={styles.arrow} />}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};
