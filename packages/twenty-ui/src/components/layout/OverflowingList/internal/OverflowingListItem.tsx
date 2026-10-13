import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { type ReactElement, useLayoutEffect, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../OverflowingList.module.scss';

import { useFocusedElementUnmountRef } from './useFocusedElementUnmountRef';

type OverflowingListItemProps = {
  children: ReactElement;
  index: number;
  isHidden: boolean;
  isLastVisible: boolean;
  isInPopup: boolean;
  onFocusLost: (options: {
    index: number;
    element: HTMLElement;
    isInPopup: boolean;
  }) => void;
};

export const OverflowingListItem = ({
  children,
  index,
  isHidden,
  isLastVisible,
  isInPopup,
  onFocusLost,
}: OverflowingListItemProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const handleFocusLost = useStableCallback((element: HTMLElement) => {
    onFocusLost({ index, element, isInPopup });
  });
  const restoreFocusWhenFocusedItemUnmounts =
    useFocusedElementUnmountRef(handleFocusLost);
  const mergedRef = useMergedRefs(
    elementRef,
    restoreFocusWhenFocusedItemUnmounts,
  );

  useLayoutEffect(() => {
    const element = elementRef.current;
    const hasFocus =
      isDefined(element) &&
      element.contains(element.ownerDocument.activeElement);

    if (isHidden && hasFocus) {
      handleFocusLost(element);
    }
  }, [isHidden, handleFocusLost]);

  return (
    <div
      ref={mergedRef}
      className={isInPopup ? styles.popupItem : styles.item}
      data-item-index={index}
      data-hidden={isHidden || undefined}
      data-last-visible={isLastVisible || undefined}
      aria-hidden={isHidden || undefined}
      inert={isHidden}
    >
      {children}
    </div>
  );
};
