import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const useRegisterDropdownLabelElement = (
  registerElementId: (id: string) => () => void,
) =>
  useCallback(
    (element: HTMLElement | null) => {
      if (!isDefined(element) || !isNonEmptyString(element.id)) {
        return;
      }

      return registerElementId(element.id);
    },
    [registerElementId],
  );
