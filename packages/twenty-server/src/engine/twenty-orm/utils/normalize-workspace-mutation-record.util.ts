import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { normalizeEmailsSubfieldValue } from 'src/engine/core-modules/record-transformer/utils/normalize-emails-subfield-value.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const normalizeWorkspaceMutationRecord = (
  record: Record<string, unknown>,
  tableShape: WorkspaceTableShape,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(record).map(([columnName, value]) => {
      const columnShape = tableShape.columnShapeByColumnName[columnName];

      if (
        isDefined(columnShape) &&
        columnShape.compositeParentFieldType === FieldMetadataType.EMAILS
      ) {
        return [
          columnName,
          normalizeEmailsSubfieldValue(columnShape.compositeSubFieldName, value),
        ];
      }

      return [columnName, value];
    }),
  );
