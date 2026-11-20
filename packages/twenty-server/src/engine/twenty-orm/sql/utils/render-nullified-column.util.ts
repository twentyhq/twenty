export const renderNullifiedColumn = ({
  quotedColumn,
  nullifyConditions,
}: {
  quotedColumn: string;
  nullifyConditions: string[];
}): string =>
  `CASE WHEN ${nullifyConditions
    .map((nullifyCondition) => `(${nullifyCondition})`)
    .join(' OR ')} THEN NULL ELSE ${quotedColumn} END`;
