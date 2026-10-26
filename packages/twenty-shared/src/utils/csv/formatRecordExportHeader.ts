import { type RecordExportColumn } from '@/types/RecordExportColumn';
import { formatValueForCSV } from '@/utils/csv/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/utils/csv/sanitizeValueForCSVExport';

export const formatRecordExportHeader = (
  columns: Pick<RecordExportColumn, 'label'>[],
): string =>
  '\uFEFF' +
  columns
    .map((column) => formatValueForCSV(sanitizeValueForCSVExport(column.label)))
    .join(',') +
  '\n';
