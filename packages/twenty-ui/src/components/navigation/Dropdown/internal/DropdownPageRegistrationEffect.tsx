import { type RefObject, useLayoutEffect } from 'react';

import { type DropdownType } from '../types/DropdownType';
import { registerDropdownPage } from './registerDropdownPage';
import { useDropdownContext } from './useDropdownContext';

type DropdownPageRegistrationEffectProps = {
  pageRef: RefObject<HTMLDivElement | null>;
  id: string;
  type: DropdownType;
};

export const DropdownPageRegistrationEffect = ({
  pageRef,
  id,
  type,
}: DropdownPageRegistrationEffectProps) => {
  const { rowRegistry } = useDropdownContext();

  useLayoutEffect(
    () =>
      registerDropdownPage({
        rowRegistry,
        page: { id, type, elementRef: pageRef },
      }),
    [pageRef, rowRegistry, id, type],
  );

  return null;
};
