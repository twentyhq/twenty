import { useContext } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { DropdownPlacementContext } from '../internal/DropdownPlacementContext';

export const useDropdownPlacementOrThrow = () => {
  const placement = useContext(DropdownPlacementContext);

  if (!isDefined(placement)) {
    throw new Error(
      doNotTranslate(
        'useDropdownPlacementOrThrow must be used within Dropdown.Content',
      ),
    );
  }

  return placement;
};
