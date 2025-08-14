import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { sanitizeDefaultValue } from 'src/engine/twenty-orm/workspace-schema-manager/utils/sanitize-default-value.util';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export const buildSqlColumnDefinition = (
  column: WorkspaceSchemaColumnDefinition,
): string => {
  const safeName = removeSqlDDLInjection(column.name);
  const parts = [`"${safeName}"`];

  if (column.asExpression) {
    parts.push(`AS (${column.asExpression})`); // TODO: to sanitize
    if (column.generatedType) {
      parts.push(column.generatedType);
    }
  } else {
    const safeType = removeSqlDDLInjection(column.type);

    parts.push(column.isArray ? `${safeType}[]` : safeType);

    if (column.isPrimary) {
      parts.push('PRIMARY KEY');
    }

    if (column.isNullable === false) {
      parts.push('NOT NULL');
    }

    if (column.isUnique) {
      parts.push('UNIQUE');
    }

    if (column.default !== undefined) {
      const safeDefault = sanitizeDefaultValue(column.default);

      parts.push(`DEFAULT ${safeDefault}`);
    }
  }

  return parts.join(' ');
};
