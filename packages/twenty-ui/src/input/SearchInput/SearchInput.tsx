import { Input } from '@base-ui/react/input';
import { clsx } from 'clsx';
import { type ReactNode, useContext, useState } from 'react';

import { IconFilter, IconSearch } from '@ui/icon';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { ThemeContext } from '@ui/theme-constants';

import styles from './SearchInput.module.scss';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filterDropdown?: (filterButton: ReactNode) => ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
};

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  filterDropdown,
  autoFocus,
  disabled,
  className,
}: SearchInputProps) => {
  const { theme } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);

  const filterButton = <IconButton Icon={IconFilter} variant="secondary" />;

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.inputContainer}>
        <div
          className={styles.iconContainer}
          data-focused={isFocused || undefined}
        >
          <IconSearch size={theme.icon.size.md} />
        </div>
        <Input
          className={styles.input}
          value={value}
          onValueChange={(newValue) => onChange(newValue)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
        />
      </div>
      {filterDropdown && filterDropdown(filterButton)}
    </div>
  );
};
