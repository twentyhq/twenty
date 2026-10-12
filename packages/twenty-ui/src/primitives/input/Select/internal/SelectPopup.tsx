import { Select as SelectPrimitive } from '@base-ui/react/select';

import { useProvidedTextDirection } from '@ui/primitives/layout/DirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Select.module.scss';
import { type SelectPopupProps } from '../types/SelectPopupProps';

export const SelectPopup = ({
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  alignOffset,
  alignItemWithTrigger = false,
  anchor,
  container,
  className,
  ...props
}: SelectPopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <SelectPrimitive.Portal
      container={
        container === undefined ? (themeContainer ?? undefined) : container
      }
    >
      <SelectPrimitive.Positioner
        dir={direction}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        anchor={anchor}
        className={styles.positioner}
      >
        <SelectPrimitive.Popup
          {...props}
          className={mergeClassNames(styles.popup, className)}
        />
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
};
