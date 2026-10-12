import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const useFocusedElementUnmountRef = (
  onFocusedElementUnmount: () => void,
) =>
  useCallback(
    (element: HTMLElement | null) => {
      if (!isDefined(element)) {
        return;
      }

      return () => {
        if (element.contains(element.ownerDocument.activeElement)) {
          onFocusedElementUnmount();
        }
      };
    },
    [onFocusedElementUnmount],
  );
