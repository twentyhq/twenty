import { FieldMetadataType } from 'twenty-shared/types';

import { type ComputedFieldDateSqlOperand } from 'src/engine/metadata-modules/computed-field/types/computed-field-date-sql-operand.type';

// Wall-clock time in UTC, so interval arithmetic and truncation ignore the session time zone
export const toComputedFieldUtcWallClockSql = ({
  sql,
  type,
}: ComputedFieldDateSqlOperand): string =>
  type === FieldMetadataType.DATE
    ? `${sql}::timestamp`
    : `(${sql} AT TIME ZONE 'UTC')`;
