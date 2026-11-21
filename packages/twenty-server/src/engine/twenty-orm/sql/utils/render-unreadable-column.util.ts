export const renderUnreadableColumn = ({
  quotedColumn,
  unreadableConditions,
}: {
  quotedColumn: string;
  unreadableConditions: string[];
}): string =>
  `CASE WHEN ${unreadableConditions
    .map((unreadableCondition) => `(${unreadableCondition})`)
    .join(' OR ')} THEN NULL ELSE ${quotedColumn} END`;
