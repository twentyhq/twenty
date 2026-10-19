import { type RefObject, memo, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type OverflowingListItemFocusEffectProps = {
  elementRef: RefObject<HTMLDivElement | null>;
  isHidden: boolean;
  onFocusLost: (element: HTMLElement) => void;
};

export const OverflowingListItemFocusEffect = memo(
  ({
    elementRef,
    isHidden,
    onFocusLost,
  }: OverflowingListItemFocusEffectProps) => {
    useLayoutEffect(() => {
      const element = elementRef.current;
      const hasFocus =
        isDefined(element) &&
        element.contains(element.ownerDocument.activeElement);

      if (isHidden && hasFocus) {
        onFocusLost(element);
      }
    }, [elementRef, isHidden, onFocusLost]);

    return null;
  },
);
