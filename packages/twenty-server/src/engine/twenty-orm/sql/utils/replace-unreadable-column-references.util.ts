import { isDefined } from 'twenty-shared/utils';

import { SQL_STRING_LITERAL_PATTERN } from 'src/engine/twenty-orm/sql/constants/sql-string-literal-pattern.constant';
import { type UnreadableColumnReplacements } from 'src/engine/twenty-orm/sql/utils/build-unreadable-column-replacements.util';

export const replaceUnreadableColumnReferences = ({
  expression,
  unreadableColumnReplacements,
}: {
  expression: string;
  unreadableColumnReplacements: UnreadableColumnReplacements | undefined;
}): string => {
  if (!isDefined(unreadableColumnReplacements)) {
    return expression;
  }

  return expression
    .split(SQL_STRING_LITERAL_PATTERN)
    .map((segment, segmentIndex) =>
      segmentIndex % 2 === 1
        ? segment
        : segment.replace(
            unreadableColumnReplacements.quotedColumnPattern,
            (quotedColumn) =>
              unreadableColumnReplacements.replacementByQuotedColumn.get(
                quotedColumn,
              ) ?? quotedColumn,
          ),
    )
    .join('');
};
