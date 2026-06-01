import { type ShahryarReportSummaryDTO } from 'src/modules/shahryar/dtos/shahryar-report.dto';

const escapeCsvValue = (value: number | string): string => {
  const rawValue = String(value);

  if (
    rawValue.includes(',') ||
    rawValue.includes('"') ||
    rawValue.includes('\n')
  ) {
    return `"${rawValue.replace(/"/g, '""')}"`;
  }

  return rawValue;
};

export const buildShahryarReportCsv = (
  summary: ShahryarReportSummaryDTO,
): string => {
  const rows = summary.rows.map((row) =>
    [
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
    ]
      .map(escapeCsvValue)
      .join(','),
  );

  return [
    'Period,Label,Visits,Sales Cartons,Requested Cartons,Paid Amount,Penalty Amount,Absences,Primary Insight,Secondary Insight,Notes',
    ...rows,
  ].join('\n');
};
