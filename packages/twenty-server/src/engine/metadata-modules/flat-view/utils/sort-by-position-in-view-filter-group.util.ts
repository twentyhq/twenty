// For view filters and view filter groups: rows without a position come last
export const sortByPositionInViewFilterGroup = <
  TViewFilterOrViewFilterGroup extends {
    id: string;
    positionInViewFilterGroup?: number | null;
  },
>(
  viewFiltersOrViewFilterGroups: TViewFilterOrViewFilterGroup[],
): TViewFilterOrViewFilterGroup[] =>
  [...viewFiltersOrViewFilterGroups].sort(
    (first, second) =>
      (first.positionInViewFilterGroup ?? Number.POSITIVE_INFINITY) -
        (second.positionInViewFilterGroup ?? Number.POSITIVE_INFINITY) ||
      first.id.localeCompare(second.id),
  );
