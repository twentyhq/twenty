import { createRequire } from 'node:module';

import PDFDocument = require('pdfkit');

import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';

const nodeRequire = createRequire(__filename);

const SHAHRYAR_PDF_FONT_PATH = nodeRequire.resolve(
  '@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff',
);
const PAGE_BOTTOM_BUFFER = 56;
const SUMMARY_GRID_COLUMNS = 2;

type ShahryarPdfDocument = InstanceType<typeof PDFDocument>;

const formatAmount = (amount: number): string => amount.toLocaleString('en-US');

const formatGrowth = (percent: number): string =>
  `${percent > 0 ? '+' : ''}${percent}%`;

const collectPdfBuffer = (document: ShahryarPdfDocument): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    document.on('data', (chunk) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });

const ensurePageSpace = ({
  document,
  minimumHeight,
}: {
  document: ShahryarPdfDocument;
  minimumHeight: number;
}): void => {
  if (
    document.y + minimumHeight <=
    document.page.height - document.page.margins.bottom - PAGE_BOTTOM_BUFFER
  ) {
    return;
  }

  document.addPage();
  document.font(SHAHRYAR_PDF_FONT_PATH);
};

const writeTitle = (document: ShahryarPdfDocument, title: string): void => {
  ensurePageSpace({ document, minimumHeight: 42 });
  document
    .fontSize(18)
    .fillColor('#17223B')
    .text(title, { align: 'right', features: ['rtla'] });
  document.moveDown(0.5);
};

const writeSectionTitle = (
  document: ShahryarPdfDocument,
  title: string,
): void => {
  ensurePageSpace({ document, minimumHeight: 34 });
  document
    .fontSize(13)
    .fillColor('#17223B')
    .text(title, { align: 'right', features: ['rtla'] });
  document.moveDown(0.3);
};

const writeLine = (document: ShahryarPdfDocument, text: string): void => {
  ensurePageSpace({ document, minimumHeight: 22 });
  document
    .fontSize(10)
    .fillColor('#3B4252')
    .text(text, { align: 'right', features: ['rtla'] });
};

const writeSummaryGrid = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  const items = [
    ['ڕێکەوتی ڕاپۆرت', summary.referenceDate],
    ['مارکێتی چالاک', String(summary.activeMarketCount)],
    ['موشریفی چالاک', String(summary.activeSupervisorCount)],
    ['کۆی سەردان', String(summary.totalVisits)],
    ['فرۆشتنی کارتۆن', String(summary.totalSalesCartons)],
    ['داواکاری کارتۆن', String(summary.totalRequestedCartons)],
    ['پارەدان', formatAmount(summary.totalPaidAmount)],
    ['غرامە', formatAmount(summary.totalPenaltyAmount)],
    ['غیابات', String(summary.totalAbsences)],
    [
      'باک ئەپ',
      `${summary.backupStatus.label} - ${summary.backupStatus.lastRunLabel}`,
    ],
  ];

  for (let index = 0; index < items.length; index += SUMMARY_GRID_COLUMNS) {
    ensurePageSpace({ document, minimumHeight: 34 });

    const rowItems = items.slice(index, index + SUMMARY_GRID_COLUMNS);
    const rowText = rowItems
      .map(([label, value]) => `${label}: ${value}`)
      .join('     ');

    writeLine(document, rowText);
  }

  document.moveDown(0.4);
};

const writePeriodRows = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  writeSectionTitle(document, 'پوختەی ماوەکان');

  for (const row of summary.rows) {
    writeLine(
      document,
      `${row.label}: ${row.visits} سەردان، ${row.salesCartons} فرۆشتن، ${row.requestedCartons} داواکاری، ${formatAmount(row.paidAmount)} پارەدان`,
    );
  }

  document.moveDown(0.4);
};

const writeRankedMetrics = ({
  document,
  metrics,
  title,
  valueLabel,
}: {
  document: ShahryarPdfDocument;
  metrics: ShahryarReportSummaryDTO['analytics']['bestMarkets'];
  title: string;
  valueLabel: string;
}): void => {
  writeSectionTitle(document, title);

  if (metrics.length === 0) {
    writeLine(document, '-');

    return;
  }

  for (const [index, metric] of metrics.entries()) {
    writeLine(
      document,
      `${index + 1}. ${metric.label}: ${metric.value} ${valueLabel}، ${metric.secondaryValue} ${metric.secondaryLabel}`,
    );
  }

  document.moveDown(0.4);
};

const writeDistrictComparison = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  writeSectionTitle(document, 'بەراوردی ناوچەکان');

  if (summary.analytics.districtComparisons.length === 0) {
    writeLine(document, '-');

    return;
  }

  for (const district of summary.analytics.districtComparisons) {
    writeLine(
      document,
      `${district.district}: ${district.activeMarketCount} مارکێت، ${district.visitCount} سەردان، ${district.salesCartons} فرۆشتن، ${formatAmount(district.paidAmount)} پارەدان`,
    );
  }

  document.moveDown(0.4);
};

const writeTrend = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  writeSectionTitle(document, 'ڕەوتی فرۆشتن و پارەدان');

  for (const point of summary.analytics.salesPaymentTrend) {
    writeLine(
      document,
      `${point.label}: ${point.salesCartons} فرۆشتن، ${point.requestedCartons} داواکاری، ${formatAmount(point.paidAmount)} پارەدان`,
    );
  }

  document.moveDown(0.4);
};

const writeGrowth = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  const growth = summary.analytics.monthlyGrowth;

  writeSectionTitle(document, 'گەشەی مانگانە');
  writeLine(
    document,
    `فرۆشتن: ${growth.currentMonthSalesCartons} ئێستا، ${growth.previousMonthSalesCartons} پێشوو، ${formatGrowth(growth.salesGrowthPercent)}`,
  );
  writeLine(
    document,
    `پارەدان: ${formatAmount(growth.currentMonthPaidAmount)} ئێستا، ${formatAmount(growth.previousMonthPaidAmount)} پێشوو، ${formatGrowth(growth.paymentGrowthPercent)}`,
  );
};

const writeNotifications = (
  document: ShahryarPdfDocument,
  summary: ShahryarReportSummaryDTO,
): void => {
  writeSectionTitle(document, 'ئاگادارکردنەوەکان');

  if (summary.notifications.length === 0) {
    writeLine(document, '-');

    return;
  }

  for (const notification of summary.notifications) {
    writeLine(document, notification.message);
  }
};

export const buildShahryarReportPdf = async (
  summary: ShahryarReportSummaryDTO,
): Promise<Buffer> => {
  const document = new PDFDocument({
    margin: 44,
    size: 'A4',
  });
  const bufferPromise = collectPdfBuffer(document);

  document.info.Title = 'Shahryar OPS Report';
  document.info.Author = 'Twenty';
  document.font(SHAHRYAR_PDF_FONT_PATH);
  writeTitle(document, 'ڕاپۆرتی Shahryar OPS');
  writeSummaryGrid(document, summary);
  writePeriodRows(document, summary);
  writeRankedMetrics({
    document,
    metrics: summary.analytics.bestMarkets,
    title: 'باشترین مارکێتەکان',
    valueLabel: 'کارتۆن',
  });
  writeRankedMetrics({
    document,
    metrics: summary.analytics.mostActiveSupervisors,
    title: 'چالاکترین موشریفەکان',
    valueLabel: 'سەردان',
  });
  writeDistrictComparison(document, summary);
  writeTrend(document, summary);
  writeGrowth(document, summary);
  writeNotifications(document, summary);
  document.end();

  return await bufferPromise;
};
