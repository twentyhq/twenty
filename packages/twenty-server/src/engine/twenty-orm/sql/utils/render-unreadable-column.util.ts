export const renderUnreadableColumn = ({
  quotedColumn,
  unreadableConditions,
  placeholder = 'NULL',
}: {
  quotedColumn: string;
  unreadableConditions: string[];
  placeholder?: string;
}): string =>
  `CASE WHEN ${unreadableConditions
    .map((unreadableCondition) => `(${unreadableCondition})`)
    .join(' OR ')} THEN ${placeholder} ELSE ${quotedColumn} END`;
