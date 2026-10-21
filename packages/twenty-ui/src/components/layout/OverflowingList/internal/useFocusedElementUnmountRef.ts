import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const useFocusedElementUnmountRef = (
  onFocusedElementUnmount: (element: HTMLElement) => void,
) =>
  useCallback(
    (element: HTMLElement | null) => {
      if (!isDefined(element)) {
        return;
      }

      return () => {
        const document = element.ownerDocument;
        const hadFocus = element.contains(document.activeElement);

        queueMicrotask(() => {
          const hasLostFocus = document.activeElement === document.body;

          if (hadFocus && !element.isConnected && hasLostFocus) {
            onFocusedElementUnmount(element);
          }
        });
      };
    },
    [onFocusedElementUnmount],
  );
