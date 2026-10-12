import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompleteInputGroupProps } from '../types/AutocompleteInputGroupProps';

export const AutocompleteInputGroup = ({
  className,
  ...props
}: AutocompleteInputGroupProps) => (
  <AutocompletePrimitive.InputGroup
    {...props}
    className={mergeClassNames(styles.inputGroup, className)}
  />
);
