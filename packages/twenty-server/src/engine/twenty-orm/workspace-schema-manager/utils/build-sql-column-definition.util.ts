import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export const buildSqlColumnDefinition = (
  column: WorkspaceSchemaColumnDefinition,
): string => {
  const safeName = removeSqlDDLInjection(column.name);
  const parts = [`"${safeName}"`];

  parts.push(column.isArray ? `${column.type}[]` : column.type);

  if (column.asExpression && column.type === 'tsvector') {
    parts.push(`GENERATED ALWAYS AS (${column.asExpression})`); // TODO: to sanitize
    if (column.generatedType) {
      parts.push(column.generatedType);
    }
  }

  if (column.isPrimary) {
    parts.push('PRIMARY KEY');
  }

  if (column.isNullable === false) {
    parts.push('NOT NULL');
  }

  if (isDefined(column.default) && column.type !== 'tsvector') {
    parts.push(`DEFAULT ${column.default}`);
  }

  return parts.join(' ');
};
