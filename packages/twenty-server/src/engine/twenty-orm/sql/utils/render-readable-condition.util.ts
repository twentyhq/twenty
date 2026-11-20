export const renderReadableCondition = (
  unreadableConditions: string[],
): string | undefined =>
  unreadableConditions.length > 0
    ? `NOT COALESCE(${[...new Set(unreadableConditions)]
        .map((unreadableCondition) => `(${unreadableCondition})`)
        .join(' OR ')}, FALSE)`
    : undefined;
