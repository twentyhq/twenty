import { useLayoutEffect, type RefObject } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownSearchProps } from '../types/DropdownSearchProps';
import { getDropdownSearchTarget } from './getDropdownSearchTarget';
import { useDropdownContext } from './useDropdownContext';

type DropdownSearchEffectProps = {
  searchRef: RefObject<HTMLInputElement | null>;
  value: DropdownSearchProps['value'];
};

export const DropdownSearchEffect = ({
  searchRef,
  value,
}: DropdownSearchEffectProps) => {
  const { setSearchTargetId } = useDropdownContext();

  useLayoutEffect(() => {
    const content = searchRef.current?.closest<HTMLElement>(
      '[data-dropdown-content]',
    );

    if (isDefined(content)) {
      setSearchTargetId(getDropdownSearchTarget(content)?.id);
    }
  }, [searchRef, value, setSearchTargetId]);

  return null;
};
