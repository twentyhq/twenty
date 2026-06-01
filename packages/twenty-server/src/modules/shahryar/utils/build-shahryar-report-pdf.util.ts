import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';

const PDF_LINE_LIMIT = 48;

const escapePdfString = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');

const toPdfVisibleText = (value: string): string =>
  value.replace(/[^\x20-\x7e]/g, '?');

const buildPdfLines = (summary: ShahryarReportSummaryDTO): string[] => [
  'Shahryar OPS Report',
  `Reference date: ${summary.referenceDate}`,
  `Markets: ${summary.activeMarketCount}`,
  `Active supervisors: ${summary.activeSupervisorCount}`,
  `Total visits: ${summary.totalVisits}`,
  `Sales cartons: ${summary.totalSalesCartons}`,
  `Requested cartons: ${summary.totalRequestedCartons}`,
  `Payments: ${summary.totalPaidAmount}`,
  `Penalties: ${summary.totalPenaltyAmount}`,
  `Absences: ${summary.totalAbsences}`,
  `Backup: ${summary.backupStatus.label} (${summary.backupStatus.lastRunLabel})`,
  '',
  'Period | Visits | Sales | Requests | Payments | Penalties | Absences',
  ...summary.rows.map(
    (row) =>
      `${row.period} | ${row.visits} | ${row.salesCartons} | ${row.requestedCartons} | ${row.paidAmount} | ${row.penaltyAmount} | ${row.absenceCount}`,
  ),
  '',
  'Notifications',
  ...summary.notifications.map(
    (notification) =>
      `${notification.kind}: ${notification.supervisorName} ${notification.marketName ?? ''}`,
  ),
];

const buildPdfContentStream = (summary: ShahryarReportSummaryDTO): string =>
  [
    'BT',
    '/F1 11 Tf',
    '50 760 Td',
    '14 TL',
    ...buildPdfLines(summary)
      .slice(0, PDF_LINE_LIMIT)
      .map((line) => `(${escapePdfString(toPdfVisibleText(line))}) Tj T*`),
    'ET',
  ].join('\n');

export const buildShahryarReportPdf = (
  summary: ShahryarReportSummaryDTO,
): Buffer => {
  const contentStream = buildPdfContentStream(summary);
  const contentLength = Buffer.byteLength(contentStream, 'utf8');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`,
  ];

  let document = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(document, 'utf8'));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(document, 'utf8');
  const xrefEntries = offsets.map((offset, index) =>
    index === 0
      ? '0000000000 65535 f '
      : `${String(offset).padStart(10, '0')} 00000 n `,
  );

  document += [
    'xref',
    `0 ${objects.length + 1}`,
    ...xrefEntries,
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');

  return Buffer.from(document, 'utf8');
};
