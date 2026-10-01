import { useLayoutEffect, useRef, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getVisibleItemCount } from './getVisibleItemCount';
import { measureItemWidths } from './measureItemWidths';

const FALLBACK_MEASUREMENT_INTERVAL_MS = 100;

export const useExpandableListLayout = ({
  itemCount,
  inlineItemCount,
  reserveCountSpace,
  isMeasurementEnabled,
}: {
  itemCount: number;
  inlineItemCount: number;
  reserveCountSpace: boolean;
  isMeasurementEnabled: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const measureRef = useRef<() => void>(undefined);
  const layoutInputRef = useRef({ itemCount, reserveCountSpace });
  const [visibleItemCount, setVisibleItemCount] = useState(inlineItemCount);
  const [hasOverflow, setHasOverflow] = useState(itemCount > inlineItemCount);

  useLayoutEffect(() => {
    layoutInputRef.current = { itemCount, reserveCountSpace };
    measureRef.current?.();
  }, [itemCount, inlineItemCount, reserveCountSpace]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;

    if (!isMeasurementEnabled || !isDefined(container) || !isDefined(items)) {
      return;
    }

    const supportsSynchronousLayout = isDefined(globalThis.ResizeObserver);
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

      const latestLayoutInput = layoutInputRef.current;
      const itemWidths = measureItemWidths({
        items,
        itemElements,
        supportsSynchronousLayout,
      });
      const gap = parseFloat(getComputedStyle(items).columnGap) || 0;
      const containerWidth = container.clientWidth;
      const fittedItemCount = getVisibleItemCount({
        itemWidths,
        availableWidth: containerWidth,
        gap,
        includePartialItem: false,
      });
      const nextHasOverflow = latestLayoutInput.itemCount > fittedItemCount;
      const triggerWidth = triggerRef.current?.offsetWidth ?? 0;
      const availableWidth =
        latestLayoutInput.reserveCountSpace && nextHasOverflow
          ? Math.max(0, containerWidth - triggerWidth - gap)
          : containerWidth;

      setHasOverflow(nextHasOverflow);
      setVisibleItemCount(
        getVisibleItemCount({
          itemWidths,
          availableWidth,
          gap,
          includePartialItem: !latestLayoutInput.reserveCountSpace,
        }),
      );
    };

    const observer = supportsSynchronousLayout
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
  }, [isMeasurementEnabled]);

  return { containerRef, itemsRef, triggerRef, visibleItemCount, hasOverflow };
};
