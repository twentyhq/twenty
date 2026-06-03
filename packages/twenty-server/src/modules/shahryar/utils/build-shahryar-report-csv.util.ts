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
  const periodRows = summary.rows.map((row) =>
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
  const bestMarketRows = summary.analytics.bestMarkets.map((market) =>
    [market.label, market.value, market.secondaryLabel, market.secondaryValue]
      .map(escapeCsvValue)
      .join(','),
  );
  const supervisorRows = summary.analytics.mostActiveSupervisors.map(
    (supervisor) =>
      [
        supervisor.label,
        supervisor.value,
        supervisor.secondaryLabel,
        supervisor.secondaryValue,
      ]
        .map(escapeCsvValue)
        .join(','),
  );
  const districtRows = summary.analytics.districtComparisons.map((district) =>
    [
      district.district,
      district.activeMarketCount,
      district.visitCount,
      district.salesCartons,
      district.paidAmount,
    ]
      .map(escapeCsvValue)
      .join(','),
  );
  const trendRows = summary.analytics.salesPaymentTrend.map((point) =>
    [
      point.label,
      point.visits,
      point.salesCartons,
      point.requestedCartons,
      point.paidAmount,
    ]
      .map(escapeCsvValue)
      .join(','),
  );
  const growth = summary.analytics.monthlyGrowth;

  return [
    'Report Summary',
    `Reference Date,${escapeCsvValue(summary.referenceDate)}`,
    '',
    'Period Rows',
    'Period,Label,Visits,Sales Cartons,Requested Cartons,Paid Amount,Penalty Amount,Absences,Primary Insight,Secondary Insight,Notes',
    ...periodRows,
    '',
    'Best Markets',
    'Market,Sales Cartons,Secondary Label,Secondary Value',
    ...bestMarketRows,
    '',
    'Most Active Supervisors',
    'Supervisor,Visits,Secondary Label,Secondary Value',
    ...supervisorRows,
    '',
    'District Comparison',
    'District,Active Markets,Visits,Sales Cartons,Paid Amount',
    ...districtRows,
    '',
    'Sales and Payment Trend',
    'Month,Visits,Sales Cartons,Requested Cartons,Paid Amount',
    ...trendRows,
    '',
    'Monthly Growth',
    'Metric,Current Month,Previous Month,Growth Percent',
    [
      'Sales Cartons',
      growth.currentMonthSalesCartons,
      growth.previousMonthSalesCartons,
      growth.salesGrowthPercent,
    ]
      .map(escapeCsvValue)
      .join(','),
    [
      'Paid Amount',
      growth.currentMonthPaidAmount,
      growth.previousMonthPaidAmount,
      growth.paymentGrowthPercent,
    ]
      .map(escapeCsvValue)
      .join(','),
  ].join('\n');
};
