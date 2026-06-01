import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';

const escapeXmlValue = (value: number | string): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildCell = (value: number | string): string => {
  const cellType = typeof value === 'number' ? 'Number' : 'String';

  return `<Cell><Data ss:Type="${cellType}">${escapeXmlValue(value)}</Data></Cell>`;
};

const buildRow = (values: (number | string)[]): string =>
  `<Row>${values.map(buildCell).join('')}</Row>`;

export const buildShahryarReportExcelXml = (
  summary: ShahryarReportSummaryDTO,
): string => {
  const header = [
    'ماوە',
    'ناونیشان',
    'سەردان',
    'فرۆشتنی کارتۆن',
    'داواکاری کارتۆن',
    'پارەدان',
    'غرامە',
    'غیابات',
    'پوختەی 1',
    'پوختەی 2',
    'تێبینی',
  ];
  const rows = summary.rows.map((row) =>
    buildRow([
      row.period,
      row.label,
      row.visits,
      row.salesCartons,
      row.requestedCartons,
      row.paidAmount,
      row.penaltyAmount,
      row.absenceCount,
      row.primaryInsight,
      row.secondaryInsight,
      row.notes.join(' | '),
    ]),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    ' <Worksheet ss:Name="Shahryar Report">',
    '  <Table>',
    buildRow(header),
    ...rows,
    '  </Table>',
    ' </Worksheet>',
    '</Workbook>',
  ].join('\n');
};
