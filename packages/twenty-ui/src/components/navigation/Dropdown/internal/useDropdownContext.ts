import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { DropdownContext } from './DropdownContext';

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);

  if (!isDefined(context)) {
    throw new Error('Dropdown components must be inside Dropdown.Root');
  }

  return context;
};
