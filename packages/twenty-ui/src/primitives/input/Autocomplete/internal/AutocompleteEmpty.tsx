import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompleteEmptyProps } from '../types/AutocompleteEmptyProps';

export const AutocompleteEmpty = ({
  className,
  ...props
}: AutocompleteEmptyProps) => (
  <AutocompletePrimitive.Empty
    {...props}
    className={mergeClassNames(styles.empty, className)}
  />
);
