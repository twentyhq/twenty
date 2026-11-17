import { FieldMetadataType } from 'twenty-shared/types';

import { type ComputedFieldDateSqlOperand } from 'src/engine/metadata-modules/computed-field/types/computed-field-date-sql-operand.type';

export const toComputedFieldInstantSql = ({
  sql,
  type,
}: ComputedFieldDateSqlOperand): string =>
  type === FieldMetadataType.DATE
    ? `(${sql}::timestamp AT TIME ZONE 'UTC')`
    : sql;
