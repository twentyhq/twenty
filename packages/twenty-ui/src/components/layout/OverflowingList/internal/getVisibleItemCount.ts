export const getVisibleItemCount = ({
  itemWidths,
  availableWidth,
  gap,
  includePartialItem,
}: {
  itemWidths: number[];
  availableWidth: number;
  gap: number;
  includePartialItem: boolean;
}) => {
  let occupiedWidth = 0;
  let visibleItemCount = 0;

  for (const itemWidth of itemWidths) {
    const nextOccupiedWidth =
      occupiedWidth + itemWidth + (visibleItemCount > 0 ? gap : 0);

    const shouldKeepFirstItemVisible = visibleItemCount === 0;

    if (!shouldKeepFirstItemVisible && nextOccupiedWidth > availableWidth) {
      const partialItemFits = occupiedWidth + gap < availableWidth;

      return includePartialItem && partialItemFits
        ? visibleItemCount + 1
        : visibleItemCount;
    }

    occupiedWidth = nextOccupiedWidth;
    visibleItemCount += 1;
  }

  return visibleItemCount;
};
