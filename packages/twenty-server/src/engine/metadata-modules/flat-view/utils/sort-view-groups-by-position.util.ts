export const sortViewGroupsByPosition = <
  TViewGroup extends { id: string; position: number },
>(
  viewGroups: TViewGroup[],
): TViewGroup[] =>
  [...viewGroups].sort(
    (firstViewGroup, secondViewGroup) =>
      firstViewGroup.position - secondViewGroup.position ||
      firstViewGroup.id.localeCompare(secondViewGroup.id),
  );
