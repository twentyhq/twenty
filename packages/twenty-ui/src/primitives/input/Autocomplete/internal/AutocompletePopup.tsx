import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { isFunction } from '@sniptt/guards';

import { useProvidedTextDirection } from '@ui/primitives/layout/TextDirectionProvider/internal/useProvidedTextDirection';
import { useThemeContainer } from '@ui/theme';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Autocomplete.module.scss';
import { type AutocompletePopupProps } from '../types/AutocompletePopupProps';

export const AutocompletePopup = ({
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  alignOffset,
  anchor,
  collisionPadding,
  width,
  style,
  container,
  className,
  ...props
}: AutocompletePopupProps) => {
  const themeContainer = useThemeContainer();
  const direction = useProvidedTextDirection();

  return (
    <AutocompletePrimitive.Portal
      container={
        container === undefined ? (themeContainer ?? undefined) : container
      }
    >
      <AutocompletePrimitive.Positioner
        dir={direction}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        className={styles.positioner}
      >
        <AutocompletePrimitive.Popup
          {...props}
          className={mergeClassNames(styles.popup, className)}
          style={(state) => ({
            width,
            minInlineSize: isDefined(width) ? 0 : undefined,
            ...(isFunction(style) ? style(state) : style),
          })}
        />
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
};
