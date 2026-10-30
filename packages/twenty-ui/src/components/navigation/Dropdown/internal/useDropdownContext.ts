import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { DropdownContext } from './DropdownContext';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate('Dropdown components must be inside Dropdown.Root'),
    );
  }

  return context;
};
