import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useRef } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownSearchProps } from '../types/DropdownSearchProps';
import { DropdownSearchRegistrationEffect } from './DropdownSearchRegistrationEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownSearch = ({
  onValueChange,
  className,
  ref,
  ...props
}: DropdownSearchProps) => {
  const { searchTargetId } = useDropdownContext();
  const searchRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, searchRef);

  return (
    <div className={styles.searchContainer}>
      <Input
        type="search"
        autoComplete="off"
        aria-activedescendant={searchTargetId}
        {...props}
        ref={mergedRef}
        data-dropdown-search=""
        className={mergeClassNames(styles.search, className)}
        onValueChange={(value) => onValueChange?.(value)}
      />
      <DropdownSearchRegistrationEffect
        searchRef={searchRef}
        disabled={props.disabled ?? false}
      />
    </div>
  );
};
