export const renderReadableCondition = (
  unreadableConditions: string[],
): string | undefined => {
  if (unreadableConditions.length === 0) {
    return undefined;
  }

  const anyUnreadableCondition = [...new Set(unreadableConditions)]
    .map((unreadableCondition) => `(${unreadableCondition})`)
    .join(' OR ');

  return `NOT COALESCE(${anyUnreadableCondition}, FALSE)`;
};
