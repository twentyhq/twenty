import { type RecordExportColumn } from '@/types/RecordExportColumn';
import { formatValueForCSV } from '@/utils/csv/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/utils/csv/sanitizeValueForCSVExport';

export const formatRecordExportHeader = (
  columns: RecordExportColumn[],
): string =>
  '\uFEFF' +
  columns
    .map((column) => formatValueForCSV(sanitizeValueForCSVExport(column.label)))
    .join(',') +
  '\n';
