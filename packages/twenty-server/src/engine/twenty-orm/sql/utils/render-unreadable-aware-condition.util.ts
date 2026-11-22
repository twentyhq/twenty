export const renderUnreadableAwareCondition = ({
  condition,
  unreadableConditions,
}: {
  condition: string;
  unreadableConditions: string[];
}): string => {
  if (unreadableConditions.length === 0) {
    return condition;
  }

  const anyUnreadableCondition = unreadableConditions
    .map((unreadableCondition) => `(${unreadableCondition})`)
    .join(' OR ');

  return `(CASE WHEN COALESCE(${anyUnreadableCondition}, FALSE) THEN NULL ELSE ${condition} END)`;
};
