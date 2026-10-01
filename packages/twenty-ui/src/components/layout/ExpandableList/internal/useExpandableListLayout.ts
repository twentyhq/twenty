import { useLayoutEffect, useRef, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getVisibleItemCount } from './getVisibleItemCount';

const FALLBACK_MEASUREMENT_INTERVAL_MS = 100;

export const useExpandableListLayout = ({
  itemCount,
  inlineItemCount,
  reserveCountSpace,
}: {
  itemCount: number;
  inlineItemCount: number;
  reserveCountSpace: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [visibleItemCount, setVisibleItemCount] = useState(inlineItemCount);
  const [hasOverflow, setHasOverflow] = useState(itemCount > inlineItemCount);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;

    if (!isDefined(container) || !isDefined(items)) {
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

      items.setAttribute('data-measuring', '');
      const itemWidths = itemElements.map((item) => item.clientWidth);
      items.removeAttribute('data-measuring');
      const gap = parseFloat(getComputedStyle(items).columnGap) || 0;
      const containerWidth = container.clientWidth;
      const fittedItemCount = getVisibleItemCount({
        itemWidths,
        availableWidth: containerWidth,
        gap,
        includePartialItem: false,
      });
      const nextHasOverflow = itemCount > fittedItemCount;
      const triggerWidth = triggerRef.current?.offsetWidth ?? 0;
      const availableWidth =
        reserveCountSpace && nextHasOverflow
          ? Math.max(0, containerWidth - triggerWidth - gap)
          : containerWidth;

      setHasOverflow(nextHasOverflow);
      setVisibleItemCount(
        getVisibleItemCount({
          itemWidths,
          availableWidth,
          gap,
          includePartialItem: !reserveCountSpace,
        }),
      );
    };

    const observer = isDefined(globalThis.ResizeObserver)
      ? new ResizeObserver(measure)
      : undefined;

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
        clearInterval(interval);
        contentObserver.disconnect();
        window.removeEventListener('resize', measure);
      };
    }

    return () => {
      contentObserver.disconnect();
      observer.disconnect();
    };
  }, [itemCount, inlineItemCount, reserveCountSpace]);

  return { containerRef, itemsRef, triggerRef, visibleItemCount, hasOverflow };
};
