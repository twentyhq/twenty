export const sortViewSortsByCreation = <
  TViewSort extends { id: string; createdAt: Date },
>(
  viewSorts: TViewSort[],
): TViewSort[] =>
  [...viewSorts].sort(
    (firstViewSort, secondViewSort) =>
      firstViewSort.createdAt.getTime() - secondViewSort.createdAt.getTime() ||
      firstViewSort.id.localeCompare(secondViewSort.id),
  );
