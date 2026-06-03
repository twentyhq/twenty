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

const buildWorksheet = ({
  name,
  rows,
}: {
  name: string;
  rows: string[];
}): string[] => [
  ` <Worksheet ss:Name="${escapeXmlValue(name)}">`,
  '  <Table>',
  ...rows,
  '  </Table>',
  ' </Worksheet>',
];

export const buildShahryarReportExcelXml = (
  summary: ShahryarReportSummaryDTO,
): string => {
  const periodHeader = [
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
  const periodRows = [
    buildRow(periodHeader),
    ...summary.rows.map((row) =>
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
    ),
  ];
  const bestMarketRows = [
    buildRow(['مارکێت', 'فرۆشتنی کارتۆن', 'ناوی دووەم', 'نرخی دووەم']),
    ...summary.analytics.bestMarkets.map((market) =>
      buildRow([
        market.label,
        market.value,
        market.secondaryLabel,
        market.secondaryValue,
      ]),
    ),
  ];
  const supervisorRows = [
    buildRow(['موشریف', 'سەردان', 'ناوی دووەم', 'نرخی دووەم']),
    ...summary.analytics.mostActiveSupervisors.map((supervisor) =>
      buildRow([
        supervisor.label,
        supervisor.value,
        supervisor.secondaryLabel,
        supervisor.secondaryValue,
      ]),
    ),
  ];
  const districtRows = [
    buildRow(['ناوچە', 'مارکێتی چالاک', 'سەردان', 'فرۆشتن', 'پارەدان']),
    ...summary.analytics.districtComparisons.map((district) =>
      buildRow([
        district.district,
        district.activeMarketCount,
        district.visitCount,
        district.salesCartons,
        district.paidAmount,
      ]),
    ),
  ];
  const trendRows = [
    buildRow(['مانگ', 'سەردان', 'فرۆشتن', 'داواکاری', 'پارەدان']),
    ...summary.analytics.salesPaymentTrend.map((point) =>
      buildRow([
        point.label,
        point.visits,
        point.salesCartons,
        point.requestedCartons,
        point.paidAmount,
      ]),
    ),
  ];
  const growth = summary.analytics.monthlyGrowth;
  const growthRows = [
    buildRow(['پێوەر', 'مانگی ئێستا', 'مانگی پێشوو', 'ڕێژەی گەشە']),
    buildRow([
      'فرۆشتنی کارتۆن',
      growth.currentMonthSalesCartons,
      growth.previousMonthSalesCartons,
      growth.salesGrowthPercent,
    ]),
    buildRow([
      'پارەدان',
      growth.currentMonthPaidAmount,
      growth.previousMonthPaidAmount,
      growth.paymentGrowthPercent,
    ]),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    ...buildWorksheet({
      name: 'Shahryar Report',
      rows: periodRows,
    }),
    ...buildWorksheet({
      name: 'Best Markets',
      rows: bestMarketRows,
    }),
    ...buildWorksheet({
      name: 'Supervisors',
      rows: supervisorRows,
    }),
    ...buildWorksheet({
      name: 'Districts',
      rows: districtRows,
    }),
    ...buildWorksheet({
      name: 'Trend',
      rows: trendRows,
    }),
    ...buildWorksheet({
      name: 'Growth',
      rows: growthRows,
    }),
    '</Workbook>',
  ].join('\n');
};
