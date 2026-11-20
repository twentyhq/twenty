import { isDefined } from 'twenty-shared/utils';

import { SQL_STRING_LITERALS } from 'src/engine/twenty-orm/sql/constants/sql-string-literals.constant';
import { type ColumnMasks } from 'src/engine/twenty-orm/sql/utils/build-column-masks.util';

export const maskNullifiedColumnReferences = ({
  expression,
  columnMasks,
}: {
  expression: string;
  columnMasks: ColumnMasks | undefined;
}): string => {
  if (!isDefined(columnMasks)) {
    return expression;
  }

  return expression
    .split(SQL_STRING_LITERALS)
    .map((segment, segmentIndex) =>
      segmentIndex % 2 === 1
        ? segment
        : segment.replace(
            columnMasks.quotedColumnPattern,
            (quotedColumn) =>
              columnMasks.maskedColumnByQuotedColumn.get(quotedColumn) ??
              quotedColumn,
          ),
    )
    .join('');
};
