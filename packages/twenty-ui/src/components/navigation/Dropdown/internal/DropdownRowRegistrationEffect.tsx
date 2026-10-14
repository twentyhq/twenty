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
  const rowRegistry = useContext(DropdownRowScopeContext)?.rowRegistry;
  const isRegisteredAsDisabled =
    disabled || ariaDisabled === true || ariaDisabled === 'true';

  useLayoutEffect(() => {
    if (!isDefined(rowRegistry)) {
      return;
    }

    return registerDropdownRow({
      rowRegistry,
      registration: {
        id,
        kind,
        disabled: isRegisteredAsDisabled,
        page,
        elementRef,
      },
    });
  }, [elementRef, rowRegistry, id, kind, isRegisteredAsDisabled, page]);

  return null;
};
