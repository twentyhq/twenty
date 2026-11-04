import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useRef } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownSearchProps } from '../types/DropdownSearchProps';
import { DropdownSearchEffect } from './DropdownSearchEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownSearch = ({
  onValueChange,
  onBlur,
  className,
  hasFocusRing = false,
  value,
  ref,
  ...props
}: DropdownSearchProps) => {
  const { searchTargetId, setSearchTargetId } = useDropdownContext();
  const searchRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(searchRef, ref);

  return (
    <div className={styles.searchContainer}>
      <Input
        type="search"
        autoComplete="off"
        aria-activedescendant={searchTargetId}
        {...props}
        ref={mergedRef}
        value={value}
        data-dropdown-search=""
        variant="plain"
        hasFocusRing={hasFocusRing}
        className={mergeClassNames(styles.search, className)}
        onValueChange={(value) => onValueChange?.(value)}
        onBlur={(event) => {
          setSearchTargetId(undefined);
          onBlur?.(event);
        }}
      />
      <DropdownSearchEffect searchRef={searchRef} value={value} />
    </div>
  );
};
