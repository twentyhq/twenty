import { FieldMetadataType } from 'twenty-shared/types';

import { type ComputedFieldDateSqlOperand } from 'src/engine/metadata-modules/computed-field/types/computed-field-date-sql-operand.type';

export const toComputedFieldUtcDateSql = ({
  sql,
  type,
}: ComputedFieldDateSqlOperand): string =>
  type === FieldMetadataType.DATE ? sql : `(${sql} AT TIME ZONE 'UTC')::date`;
