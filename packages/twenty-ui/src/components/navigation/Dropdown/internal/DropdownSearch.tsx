import { Input } from '@ui/primitives/input/Input/Input';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownSearchProps } from '../types/DropdownSearchProps';

export const DropdownSearch = ({
  onValueChange,
  enterSelects,
  className,
  ...props
}: DropdownSearchProps) => (
  <div className={styles.searchContainer}>
    <Input
      type="search"
      autoComplete="off"
      {...props}
      data-dropdown-search=""
      data-dropdown-enter-selects={enterSelects}
      className={mergeClassNames(styles.search, className)}
      onValueChange={(value) => onValueChange?.(value)}
    />
  </div>
);
