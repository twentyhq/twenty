import { FieldMetadataType } from 'twenty-shared/types';

import { type FormulaSqlColumn } from 'src/engine/metadata-modules/formula-field/types/formula-sql-column.type';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildFormulaSqlColumnValue = ({
  alias,
  formulaSqlColumn: { columnName, columnFieldMetadataType },
}: {
  alias: string;
  formulaSqlColumn: Pick<
    FormulaSqlColumn,
    'columnName' | 'columnFieldMetadataType'
  >;
}): FormulaSqlValue | undefined => {
  const column = `${escapeIdentifier(alias)}.${escapeIdentifier(columnName)}`;

  switch (columnFieldMetadataType) {
    case FieldMetadataType.TEXT:
      return { sql: column, type: 'text' };
    case FieldMetadataType.UUID:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return { sql: `${column}::text`, type: 'text' };
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return { sql: `${column}::numeric`, type: 'number' };
    case FieldMetadataType.BOOLEAN:
      return { sql: `COALESCE(${column}, FALSE)`, type: 'boolean' };
    case FieldMetadataType.DATE:
      return { sql: column, type: 'date' };
    case FieldMetadataType.DATE_TIME:
      return { sql: column, type: 'dateTime' };
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      return { sql: `${column}::text[]`, type: 'textArray' };
    case FieldMetadataType.RELATION:
      return { sql: column, type: 'record' };
    default:
      return undefined;
  }
};
