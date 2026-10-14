import {
  type AriaAttributes,
  type RefObject,
  useContext,
  useLayoutEffect,
} from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownRow } from './DropdownRow';
import { DropdownRowScopeContext } from './DropdownRowScopeContext';
import { registerDropdownRow } from './registerDropdownRow';

type DropdownRowRegistrationEffectProps = Pick<
  DropdownRow,
  'id' | 'kind' | 'disabled' | 'page'
> & {
  elementRef: RefObject<HTMLElement | null>;
  ariaDisabled?: AriaAttributes['aria-disabled'];
};

export const DropdownRowRegistrationEffect = ({
  elementRef,
  id,
  kind,
  disabled,
  ariaDisabled,
  page,
}: DropdownRowRegistrationEffectProps) => {
  const registry = useContext(DropdownRowScopeContext)?.registry;
  const isRegisteredAsDisabled =
    disabled || ariaDisabled === true || ariaDisabled === 'true';

  useLayoutEffect(() => {
    if (!isDefined(registry)) {
      return;
    }

    return registerDropdownRow({
      registry,
      registration: {
        id,
        kind,
        disabled: isRegisteredAsDisabled,
        page,
        elementRef,
      },
    });
  }, [elementRef, registry, id, kind, isRegisteredAsDisabled, page]);

  return null;
};
