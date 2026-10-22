import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { type RefObject, memo, useLayoutEffect, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { measureOverflowingListLayout } from './measureOverflowingListLayout';
import { type OverflowingListLayout } from './types/OverflowingListLayout';

const FALLBACK_MEASUREMENT_INTERVAL_MS = 100;

type OverflowingListLayoutEffectProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  itemsRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  itemCount: number;
  inlineItemCount: number;
  reserveCountSpace: boolean;
  isMeasurementEnabled: boolean;
  isOpen: boolean;
  onLayoutChange: (layout: OverflowingListLayout) => void;
  onOverflowUnavailable: () => void;
};

export const OverflowingListLayoutEffect = memo(
  ({
    containerRef,
    itemsRef,
    triggerRef,
    itemCount,
    inlineItemCount,
    reserveCountSpace,
    isMeasurementEnabled,
    isOpen,
    onLayoutChange,
    onOverflowUnavailable,
  }: OverflowingListLayoutEffectProps) => {
    const measureRef = useRef<() => void>(undefined);
    const previousMeasurementRef = useRef<{
      layout: OverflowingListLayout;
      isOpen: boolean;
    }>(undefined);
    const getLayoutInput = useStableCallback(() => ({
      itemCount,
      inlineItemCount,
      reserveCountSpace,
      isOpen,
    }));
    const updateLayout = useStableCallback(onLayoutChange);
    const closeUnavailableOverflow = useStableCallback(onOverflowUnavailable);

    useLayoutEffect(() => {
      const container = containerRef.current;
      const items = itemsRef.current;

      if (!isMeasurementEnabled || !isDefined(container) || !isDefined(items)) {
        previousMeasurementRef.current = undefined;
        return;
      }

      const observedElements = new Set<Element>();
      const measure = () => {
        const itemElements = Array.from(items.children);
        const currentElements = new Set<Element>([container, ...itemElements]);

        if (isDefined(triggerRef.current)) {
          currentElements.add(triggerRef.current);
        }

        for (const element of observedElements) {
          if (!currentElements.has(element)) {
            observer?.unobserve(element);
            observedElements.delete(element);
          }
        }

        for (const element of currentElements) {
          if (!observedElements.has(element)) {
            observer?.observe(element);
            observedElements.add(element);
          }
        }

        const layoutInput = getLayoutInput();

        if (itemElements.length !== layoutInput.inlineItemCount) {
          return;
        }

        const layout = measureOverflowingListLayout({
          container,
          items,
          trigger: triggerRef.current,
          itemElements,
          itemCount: layoutInput.itemCount,
          reserveCountSpace: layoutInput.reserveCountSpace,
        });
        const previousMeasurement = previousMeasurementRef.current;
        const wasUnavailableOpen =
          isDefined(previousMeasurement) &&
          previousMeasurement.isOpen &&
          !previousMeasurement.layout.hasOverflow;
        const isUnavailableOpen = layoutInput.isOpen && !layout.hasOverflow;
        previousMeasurementRef.current = { layout, isOpen: layoutInput.isOpen };
        updateLayout(layout);

        if (isUnavailableOpen && !wasUnavailableOpen) {
          closeUnavailableOverflow();
        }
      };

      const observer = isDefined(globalThis.ResizeObserver)
        ? new ResizeObserver(measure)
        : undefined;

      measureRef.current = measure;
      measure();

      const contentObserver = new MutationObserver(measure);
      contentObserver.observe(items, {
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden'],
        characterData: true,
        childList: true,
        subtree: true,
      });
      contentObserver.observe(container, { childList: true });

      if (!isDefined(observer)) {
        const interval = setInterval(measure, FALLBACK_MEASUREMENT_INTERVAL_MS);
        window.addEventListener('resize', measure);

        return () => {
          measureRef.current = undefined;
          clearInterval(interval);
          contentObserver.disconnect();
          window.removeEventListener('resize', measure);
        };
      }

      return () => {
        measureRef.current = undefined;
        contentObserver.disconnect();
        observer.disconnect();
      };
    }, [
      containerRef,
      itemsRef,
      triggerRef,
      isMeasurementEnabled,
      getLayoutInput,
      updateLayout,
      closeUnavailableOverflow,
    ]);

    useLayoutEffect(() => {
      measureRef.current?.();
    }, [itemCount, inlineItemCount, reserveCountSpace, isOpen]);

    return null;
  },
);
