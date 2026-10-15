import { useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type ToastFocusEffectProps = {
  element: HTMLDivElement | null;
  isFocused: boolean;
  onFocusChange: (isFocused: boolean) => void;
};

export const ToastFocusEffect = ({
  element,
  isFocused,
  onFocusChange,
}: ToastFocusEffectProps) => {
  useLayoutEffect(() => {
    if (!isFocused || !isDefined(element)) {
      return;
    }

    const reconcileFocus = () => {
      const isFocusInsideToast = element.contains(
        element.ownerDocument.activeElement,
      );

      if (!isFocusInsideToast) {
        onFocusChange(false);
      }
    };

    reconcileFocus();

    const observer = new MutationObserver(reconcileFocus);
    observer.observe(element, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [element, isFocused, onFocusChange]);

  return null;
};
