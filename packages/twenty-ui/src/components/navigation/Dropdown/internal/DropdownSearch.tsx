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
  className,
  value,
  ref,
  ...props
}: DropdownSearchProps) => {
  const { searchTargetId } = useDropdownContext();
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
        className={mergeClassNames(styles.search, className)}
        onValueChange={(value) => onValueChange?.(value)}
      />
      <DropdownSearchEffect searchRef={searchRef} value={value} />
    </div>
  );
};
