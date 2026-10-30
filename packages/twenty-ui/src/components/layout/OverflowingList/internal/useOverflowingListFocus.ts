import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { type FocusEvent, type RefObject, useCallback, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type OverflowingListProps } from '../types/OverflowingListProps';

import { focusOverflowingListFallback } from './focusOverflowingListFallback';
import { useFocusedElementUnmountRef } from './useFocusedElementUnmountRef';

type UseOverflowingListFocusOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  itemsRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  popup: HTMLDivElement | null;
  itemCount: number;
  canExpand: boolean;
  isPopupOpen: boolean;
  isOpen: boolean;
  isHovered: boolean;
  showOverflowCount: OverflowingListProps['showOverflowCount'];
  onFocusCapture: OverflowingListProps['onFocusCapture'];
  onBlurCapture: OverflowingListProps['onBlurCapture'];
};

export const useOverflowingListFocus = ({
  containerRef,
  itemsRef,
  triggerRef,
  popup,
  itemCount,
  canExpand,
  isPopupOpen,
  isOpen,
  isHovered,
  showOverflowCount,
  onFocusCapture,
  onBlurCapture,
}: UseOverflowingListFocusOptions) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [focusedItemCountVisibility, setFocusedItemCountVisibility] =
    useState<boolean>();
  const isCountVisible =
    showOverflowCount ??
    focusedItemCountVisibility ??
    (isHovered || hasFocus || isOpen);
  const restoreItemFocus = useStableCallback(
    ({
      index,
      element,
      isInPopup,
    }: {
      index: number;
      element: HTMLElement;
      isInPopup: boolean;
    }) => {
      focusOverflowingListFallback({
        items: isInPopup && canExpand ? null : itemsRef.current,
        popup: isInPopup && isPopupOpen ? popup : null,
        trigger: triggerRef.current,
        root: containerRef.current,
        removedIndex: index,
        excludedItem: element,
      });
    },
  );
  const restoreTriggerFocus = useCallback(() => {
    const container = containerRef.current;
    container?.focus();
    setHasFocus(container?.ownerDocument.activeElement === container);
    setFocusedItemCountVisibility(undefined);
  }, [containerRef]);
  const restorePopupFocus = useStableCallback(() => {
    if (isPopupOpen) {
      return;
    }

    const container = containerRef.current;
    const document = container?.ownerDocument;
    const activeElement = document?.activeElement;
    const hasFocusedInlineItem =
      isDefined(activeElement) &&
      itemsRef.current?.contains(activeElement) &&
      !isDefined(activeElement.closest('[inert]'));
    const hasExternalFocus =
      isDefined(activeElement) &&
      activeElement !== document?.body &&
      !container?.contains(activeElement) &&
      !popup?.contains(activeElement);

    if (hasFocusedInlineItem || hasExternalFocus) {
      return;
    }

    if (!canExpand) {
      focusOverflowingListFallback({
        items: itemsRef.current,
        popup: null,
        trigger: null,
        root: container,
        removedIndex: itemCount,
      });
      return;
    }

    const trigger = triggerRef.current;

    if (isDefined(trigger) && !trigger.matches(':disabled')) {
      trigger.focus({ preventScroll: true });
      return;
    }

    container?.focus({ preventScroll: true });
  });
  const schedulePopupFocusRestoration = useCallback(() => {
    queueMicrotask(restorePopupFocus);
    return false;
  }, [restorePopupFocus]);
  const resetFocusWhenFocusedTriggerUnmounts =
    useFocusedElementUnmountRef(restoreTriggerFocus);
  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    setHasFocus(true);

    if (itemsRef.current?.contains(event.target)) {
      setFocusedItemCountVisibility(
        (currentVisibility) => currentVisibility ?? isCountVisible,
      );
    }

    onFocusCapture?.(event);
  };
  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const hasRelatedFocus =
      event.currentTarget.contains(event.relatedTarget) ||
      (popup?.contains(event.relatedTarget) ?? false);
    setHasFocus(hasRelatedFocus);

    if (!itemsRef.current?.contains(event.relatedTarget)) {
      setFocusedItemCountVisibility(undefined);
    }

    onBlurCapture?.(event);
  };

  return {
    hasFocus,
    isCountVisible,
    restoreItemFocus,
    schedulePopupFocusRestoration,
    resetFocusWhenFocusedTriggerUnmounts,
    handleFocusCapture,
    handleBlurCapture,
  };
};
