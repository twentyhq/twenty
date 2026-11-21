export const renderUnreadableColumn = ({
  quotedColumn,
  unreadableConditions,
  replacement = 'NULL',
}: {
  quotedColumn: string;
  unreadableConditions: string[];
  replacement?: string;
}): string =>
  `CASE WHEN ${unreadableConditions
    .map((unreadableCondition) => `(${unreadableCondition})`)
    .join(' OR ')} THEN ${replacement} ELSE ${quotedColumn} END`;
