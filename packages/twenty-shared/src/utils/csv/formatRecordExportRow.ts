import { isDate } from '@sniptt/guards';

import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RecordExportColumn } from '@/types/RecordExportColumn';
import { formatValueForCSV } from '@/utils/csv/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/utils/csv/sanitizeValueForCSVExport';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';

export const formatRecordExportRow = ({
  columns,
  record,
}: {
  columns: RecordExportColumn[];
  record: Record<string, unknown>;
}): string =>
  columns
    .map((column) => {
      let value = record[column.fieldName];

      if (isDefined(column.subFieldName)) {
        value = isPlainObject(value) ? value[column.subFieldName] : undefined;
      }

      if (
        column.type === FieldMetadataType.CURRENCY &&
        column.subFieldName === 'amountMicros' &&
        isDefined(value)
      ) {
        value = Number(value) / 1_000_000;
      }

      if (isDate(value)) {
        value =
          column.type === FieldMetadataType.DATE
            ? value.toISOString().slice(0, 10)
            : value.toISOString();
      }

      if (
        column.type === FieldMetadataType.RAW_JSON &&
        typeof value === 'string'
      ) {
        value = JSON.stringify(value);
      }

      return formatValueForCSV(
        typeof value === 'string' ? sanitizeValueForCSVExport(value) : value,
      );
    })
    .join(',') + '\n';
