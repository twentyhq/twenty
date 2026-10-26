import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { type SearchInputProps } from './types/SearchInputProps';

import { IconSearch } from '@ui/icon';
import { Input } from '@ui/primitives/input/Input/Input';
import { InputGroup } from '@ui/primitives/input/InputGroup/InputGroup';
import { useTheme } from '@ui/theme';

import styles from './SearchInput.module.scss';

export const SearchInput = ({
  placeholder,
  actions,
  size = 'md',
  hasFocusRing = false,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: SearchInputProps) => {
  const theme = useTheme();
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.wrapper}>
      <InputGroup
        className={styles.inputGroup}
        size={size}
        hasFocusRing={hasFocusRing}
        startElement={
          <IconSearch
            className={styles.searchIcon}
            size={theme.icon.size.md}
            aria-hidden
          />
        }
      >
        <Input
          {...props}
          id={inputId}
          placeholder={placeholder}
          aria-label={
            isNonEmptyString(ariaLabelledby)
              ? undefined
              : (ariaLabel ?? placeholder)
          }
          aria-labelledby={ariaLabelledby}
        />
      </InputGroup>
      {actions}
    </div>
  );
};
