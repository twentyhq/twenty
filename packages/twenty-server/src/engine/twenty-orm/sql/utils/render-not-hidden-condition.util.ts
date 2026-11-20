export const renderNotHiddenCondition = (
  hiddenConditions: string[],
): string | undefined =>
  hiddenConditions.length > 0
    ? `NOT COALESCE(${[...new Set(hiddenConditions)]
        .map((hiddenCondition) => `(${hiddenCondition})`)
        .join(' OR ')}, FALSE)`
    : undefined;
