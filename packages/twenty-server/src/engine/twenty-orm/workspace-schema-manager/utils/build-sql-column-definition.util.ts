import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ALLOWED_GENERATED_TYPES = new Set(['STORED', 'VIRTUAL']);

export const buildSqlColumnDefinition = (
  column: WorkspaceSchemaColumnDefinition,
): string => {
  const parts = [escapeIdentifier(column.name)];

  // column.type is either a PostgreSQL type name from fieldMetadataTypeToColumnType
  // (safe enum-mapped), or a schema-qualified enum type pre-escaped by the caller.
  parts.push(column.isArray ? `${column.type}[]` : column.type);

  // asExpression is built internally by getTsVectorColumnExpressionFromFields
  // (never user-provided). Field names within are escaped at the source.
  if (column.asExpression && column.type === 'tsvector') {
    parts.push(`GENERATED ALWAYS AS (${column.asExpression})`);
    if (
      column.generatedType &&
      ALLOWED_GENERATED_TYPES.has(column.generatedType)
    ) {
      parts.push(column.generatedType);
    }
  }

  if (column.isPrimary) {
    parts.push('PRIMARY KEY');
  }

  if (column.isNullable === false) {
    parts.push('NOT NULL');
  }

  // column.default is pre-serialized by serializeDefaultValue which
  // applies escapeLiteral/removeSqlDDLInjection to the value.
  if (isDefined(column.default) && column.type !== 'tsvector') {
    parts.push(`DEFAULT ${column.default}`);
  }

  return parts.join(' ');
};
