import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Autocomplete.module.scss';
import { type AutocompleteSeparatorProps } from '../types/AutocompleteSeparatorProps';

export const AutocompleteSeparator = ({
  className,
  ...props
}: AutocompleteSeparatorProps) => (
  <AutocompletePrimitive.Separator
    {...props}
    className={mergeClassNames(styles.separator, className)}
  />
);
