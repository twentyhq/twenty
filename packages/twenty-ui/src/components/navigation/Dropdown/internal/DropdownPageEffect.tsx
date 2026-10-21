import { useLayoutEffect } from 'react';

import { type DropdownType } from '../types/DropdownType';
import { useDropdownContext } from './useDropdownContext';

type DropdownPageEffectProps = {
  id: string;
  type?: DropdownType;
  isActive: boolean;
};

export const DropdownPageEffect = ({
  id,
  type,
  isActive,
}: DropdownPageEffectProps) => {
  const { registerPage } = useDropdownContext();

  useLayoutEffect(() => {
    if (isActive) {
      registerPage({ id, type });
    }
  }, [id, type, isActive, registerPage]);

  return null;
};
