import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompleteArrowProps } from '../types/AutocompleteArrowProps';

export const AutocompleteArrow = ({
  className,
  ...props
}: AutocompleteArrowProps) => (
  <AutocompletePrimitive.Arrow
    {...props}
    className={mergeClassNames(styles.arrow, className)}
  />
);
