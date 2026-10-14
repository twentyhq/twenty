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
  const registry = useContext(DropdownRowScopeContext)?.registry;

  useLayoutEffect(() => {
    if (!isDefined(registry) || disabled) {
      return;
    }

    return registerDropdownSearch({ registry, searchRef });
  }, [searchRef, registry, disabled]);

  return null;
};
