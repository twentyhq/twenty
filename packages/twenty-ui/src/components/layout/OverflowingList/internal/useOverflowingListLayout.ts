import { useLayoutEffect, useRef, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { getVisibleItemCount } from './getVisibleItemCount';
import { measureItemWidths } from './measureItemWidths';

const FALLBACK_MEASUREMENT_INTERVAL_MS = 100;

export const useOverflowingListLayout = ({
  itemCount,
  inlineItemCount,
  reserveCountSpace,
  popup,
}: {
  itemCount: number;
  inlineItemCount: number;
  reserveCountSpace: boolean;
  popup: HTMLDivElement | null;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<() => void>(undefined);
  const layoutInputRef = useRef({
    itemCount,
    inlineItemCount,
    reserveCountSpace,
  });
  const [layout, setLayout] = useState({
    visibleItemCount: inlineItemCount,
    hasOverflow: itemCount > inlineItemCount,
    isMeasured: false,
  });

  useLayoutEffect(() => {
    layoutInputRef.current = { itemCount, inlineItemCount, reserveCountSpace };
    measureRef.current?.();
  }, [itemCount, inlineItemCount, reserveCountSpace]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;

    if (!isDefined(container) || !isDefined(items)) {
      return;
    }

    const supportsSynchronousLayout = isDefined(globalThis.ResizeObserver);
    const observedElements = new Set<Element>();
    const measure = () => {
      const itemElements = [
        ...Array.from(items.children),
        ...Array.from(popup?.children ?? []),
      ]
        .filter((element) => element.hasAttribute('data-item-index'))
        .sort(
          (firstItem, secondItem) =>
            Number(firstItem.getAttribute('data-item-index')) -
            Number(secondItem.getAttribute('data-item-index')),
        );
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

      if (itemElements.length !== latestLayoutInput.itemCount) {
        return;
      }

      const itemWidths = measureItemWidths({
        itemElements: itemElements.slice(0, latestLayoutInput.inlineItemCount),
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
      const visibleItemCount = getVisibleItemCount({
        itemWidths,
        availableWidth,
        gap,
        includePartialItem: !latestLayoutInput.reserveCountSpace,
      });

      setLayout((currentLayout) => {
        const hasChanged =
          currentLayout.visibleItemCount !== visibleItemCount ||
          currentLayout.hasOverflow !== nextHasOverflow ||
          !currentLayout.isMeasured;

        return hasChanged
          ? { visibleItemCount, hasOverflow: nextHasOverflow, isMeasured: true }
          : currentLayout;
      });
    };

    const observer = supportsSynchronousLayout
      ? new ResizeObserver(measure)
      : undefined;

    measureRef.current = measure;
    measure();

    const contentObserver = new MutationObserver(measure);
    const observationOptions = {
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden'],
      characterData: true,
      childList: true,
      subtree: true,
    };
    contentObserver.observe(items, observationOptions);
    contentObserver.observe(container, { childList: true });

    if (isDefined(popup)) {
      contentObserver.observe(popup, observationOptions);
    }

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
  }, [popup]);

  return { containerRef, itemsRef, triggerRef, ...layout };
};
