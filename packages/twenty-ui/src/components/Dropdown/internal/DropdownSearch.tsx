import { clsx } from 'clsx';

import styles from '../Dropdown.module.scss';
import { type DropdownSearchProps } from '../types/DropdownSearchProps';

export const DropdownSearch = ({
  onValueChange,
  onChange,
  className,
  ...props
}: DropdownSearchProps) => (
  <div className={styles.searchContainer}>
    <input
      type="search"
      autoComplete="off"
      {...props}
      data-dropdown-search=""
      className={clsx(styles.search, className)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.currentTarget.value);
      }}
    />
  </div>
);
