import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompleteListProps } from '../types/AutocompleteListProps';

export const AutocompleteList = ({
  className,
  ...props
}: AutocompleteListProps) => (
  <AutocompletePrimitive.List
    {...props}
    className={mergeClassNames(styles.list, className)}
  />
);
