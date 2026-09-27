import { isNonEmptyString } from '@sniptt/guards';

import {
  getSpreadsheetImportUniqueConstraints,
  getSpreadsheetImportUniqueValue,
} from '@/utils/spreadsheet-import/getSpreadsheetImportUniqueConstraints';
import { type SpreadsheetImportObjectMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportObjectMetadata';
import { type SpreadsheetImportTableHook } from '@/utils/spreadsheet-import/types/SpreadsheetImportTableHook';
import { type SpreadsheetImportValidationMessage } from '@/utils/spreadsheet-import/types/SpreadsheetImportValidationMessage';
import { isDefined } from '@/utils/validation/isDefined';

export const getSpreadsheetImportUnicityTableHook = (
  objectMetadataItem: SpreadsheetImportObjectMetadata,
): SpreadsheetImportTableHook<SpreadsheetImportValidationMessage> => {
  const uniqueConstraints =
    getSpreadsheetImportUniqueConstraints(objectMetadataItem);

  return (table, addError) => {
    for (const uniqueConstraint of uniqueConstraints) {
      const firstIndexByUniqueValue = new Map<string, number>();
      const duplicateIndices = new Set<number>();

      table.forEach((row, index) => {
        const uniqueValue = getSpreadsheetImportUniqueValue(
          row,
          uniqueConstraint,
        );

        if (!isNonEmptyString(uniqueValue)) {
          return;
        }

        const originalIndex = firstIndexByUniqueValue.get(uniqueValue);

        if (isDefined(originalIndex)) {
          duplicateIndices.add(originalIndex);
          duplicateIndices.add(index);
        } else {
          firstIndexByUniqueValue.set(uniqueValue, index);
        }
      });

      duplicateIndices.forEach((duplicateIndex) => {
        uniqueConstraint.forEach(({ columnName }) => {
          addError(duplicateIndex, columnName, {
            message: { code: 'DUPLICATE_IN_IMPORT', fieldName: columnName },
            level: 'error',
          });
        });
      });
    }

    return table;
  };
};
