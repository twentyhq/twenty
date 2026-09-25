import { Input } from '@ui/primitives/input/Input/Input';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownSearchProps } from '../types/DropdownSearchProps';
import { useDropdownContext } from './useDropdownContext';

export const DropdownSearch = ({
  onValueChange,
  className,
  ...props
}: DropdownSearchProps) => {
  const { searchTargetId } = useDropdownContext();

  return (
    <div className={styles.searchContainer}>
      <Input
        type="search"
        autoComplete="off"
        aria-activedescendant={searchTargetId}
        {...props}
        data-dropdown-search=""
        className={mergeClassNames(styles.search, className)}
        onValueChange={(value) => onValueChange?.(value)}
      />
    </div>
  );
};
