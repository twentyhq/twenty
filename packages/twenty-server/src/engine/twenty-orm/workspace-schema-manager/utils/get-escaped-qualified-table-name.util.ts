import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getEscapedQualifiedTableName = ({
  schemaName,
  tableName,
}: {
  schemaName: string;
  tableName: string;
}): string => `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
