import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { isFunction } from '@sniptt/guards';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Autocomplete.module.scss';
import { type AutocompletePopupProps } from '../types/AutocompletePopupProps';

export const AutocompletePopup = ({
  width,
  style,
  className,
  ...props
}: AutocompletePopupProps) => (
  <AutocompletePrimitive.Popup
    {...props}
    className={mergeClassNames(styles.popup, className)}
    style={(state) => ({
      width,
      minInlineSize: isDefined(width) ? 0 : undefined,
      ...(isFunction(style) ? style(state) : style),
    })}
  />
);
