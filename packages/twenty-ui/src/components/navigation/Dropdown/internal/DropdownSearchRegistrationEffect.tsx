import { type RefObject, useContext, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { DropdownRowScopeContext } from './DropdownRowScopeContext';
import { registerDropdownSearch } from './registerDropdownSearch';

type DropdownSearchRegistrationEffectProps = {
  searchRef: RefObject<HTMLInputElement | null>;
  disabled: boolean;
};

export const DropdownSearchRegistrationEffect = ({
  searchRef,
  disabled,
}: DropdownSearchRegistrationEffectProps) => {
  const rowRegistry = useContext(DropdownRowScopeContext)?.rowRegistry;

  useLayoutEffect(() => {
    if (!isDefined(rowRegistry) || disabled) {
      return;
    }

    return registerDropdownSearch({ rowRegistry, searchRef });
  }, [searchRef, rowRegistry, disabled]);

  return null;
};
