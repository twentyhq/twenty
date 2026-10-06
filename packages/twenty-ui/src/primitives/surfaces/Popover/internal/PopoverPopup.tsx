import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Popover.module.scss';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';

export const PopoverPopup = ({
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  alignOffset,
  arrow = false,
  anchor,
  collisionPadding,
  container,
  keepMounted,
  className,
  children,
  ...props
}: PopoverPopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <PopoverPrimitive.Portal
      container={container ?? themeContainer ?? undefined}
      keepMounted={keepMounted}
    >
      <PopoverPrimitive.Positioner
        dir={direction}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        className={styles.positioner}
      >
        <PopoverPrimitive.Popup
          {...props}
          className={mergeClassNames(styles.popup, className)}
        >
          {arrow && <PopoverPrimitive.Arrow className={styles.arrow} />}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};
