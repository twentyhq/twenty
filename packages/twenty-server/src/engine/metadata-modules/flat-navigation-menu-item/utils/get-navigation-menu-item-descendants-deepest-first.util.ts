export const getNavigationMenuItemDescendantsDeepestFirst = <
  TNavigationMenuItem extends { id: string },
>({
  parentId,
  userWorkspaceIdKey,
  childrenByUserWorkspaceIdAndParentId,
}: {
  parentId: string;
  userWorkspaceIdKey: string;
  childrenByUserWorkspaceIdAndParentId: Partial<
    Record<string, Partial<Record<string, TNavigationMenuItem[]>>>
  >;
}): TNavigationMenuItem[] =>
  (
    childrenByUserWorkspaceIdAndParentId[userWorkspaceIdKey]?.[parentId] ?? []
  ).flatMap((child) => [
    ...getNavigationMenuItemDescendantsDeepestFirst({
      parentId: child.id,
      userWorkspaceIdKey,
      childrenByUserWorkspaceIdAndParentId,
    }),
    child,
  ]);
