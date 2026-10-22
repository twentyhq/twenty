import { getVisibleItemCount } from './getVisibleItemCount';
import { measureItemWidths } from './measureItemWidths';
import { type OverflowingListLayout } from './types/OverflowingListLayout';

export const measureOverflowingListLayout = ({
  container,
  items,
  trigger,
  itemElements,
  itemCount,
  reserveCountSpace,
}: {
  container: HTMLElement;
  items: HTMLElement;
  trigger: HTMLElement | null;
  itemElements: Element[];
  itemCount: number;
  reserveCountSpace: boolean;
}): OverflowingListLayout => {
  const itemWidths = measureItemWidths({ items, itemElements });
  const gap = parseFloat(getComputedStyle(items).columnGap) || 0;
  const containerWidth = container.clientWidth;
  const fittedItemCount = getVisibleItemCount({
    itemWidths,
    availableWidth: containerWidth,
    gap,
    includePartialItem: false,
  });
  const hasOverflow = itemCount > fittedItemCount;
  const triggerWidth = trigger?.offsetWidth ?? 0;
  const availableWidth =
    reserveCountSpace && hasOverflow
      ? Math.max(0, containerWidth - triggerWidth - gap)
      : containerWidth;
  const visibleItemCount = getVisibleItemCount({
    itemWidths,
    availableWidth,
    gap,
    includePartialItem: true,
  });

  return { visibleItemCount, hasOverflow };
};
