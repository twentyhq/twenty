import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { DropdownContext } from './DropdownContext';

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);

  if (!isDefined(context)) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is an internal context invariant for developers.
    throw new Error('Dropdown components must be inside Dropdown.Root');
  }

  return context;
};
