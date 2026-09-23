import { useLayoutEffect } from 'react';

import { type DropdownPageProps } from '../types/DropdownPageProps';
import { useDropdownContext } from './useDropdownContext';

type DropdownPageRegistrationEffectProps = Pick<
  DropdownPageProps,
  'id' | 'type'
>;

export const DropdownPageRegistrationEffect = ({
  id,
  type,
}: DropdownPageRegistrationEffectProps) => {
  const { registerPage } = useDropdownContext();

  useLayoutEffect(() => {
    registerPage({ id, type });
  }, [id, type, registerPage]);

  return null;
};
