export type ShahryarReportPeriod = 'daily' | 'weekly' | 'monthly';

export type ShahryarReportNotificationKind = 'missing-report' | 'missed-visit';

export type ShahryarReportNotificationSeverity = 'warning' | 'critical';

export class ShahryarReportRowDTO {
  period: ShahryarReportPeriod;
  label: string;
  visits: number;
  salesCartons: number;
  requestedCartons: number;
  paidAmount: number;
  penaltyAmount: number;
  absenceCount: number;
  primaryInsight: string;
  secondaryInsight: string;
  notes: string[];
}

export class ShahryarReportNotificationDTO {
  id: string;
  kind: ShahryarReportNotificationKind;
  severity: ShahryarReportNotificationSeverity;
  supervisorId: string;
  supervisorName: string;
  marketId?: string;
  marketName?: string;
  message: string;
}

export class ShahryarReportRankedMetricDTO {
  id: string;
  label: string;
  value: number;
  secondaryLabel: string;
  secondaryValue: number;
}

export class ShahryarReportDistrictComparisonDTO {
  district: string;
  activeMarketCount: number;
  visitCount: number;
  salesCartons: number;
  paidAmount: number;
}

export class ShahryarReportTrendPointDTO {
  date: string;
  label: string;
  visits: number;
  salesCartons: number;
  requestedCartons: number;
  paidAmount: number;
}

export class ShahryarReportMonthlyGrowthDTO {
  currentMonthSalesCartons: number;
  previousMonthSalesCartons: number;
  salesGrowthPercent: number;
  currentMonthPaidAmount: number;
  previousMonthPaidAmount: number;
  paymentGrowthPercent: number;
}

export class ShahryarReportAnalyticsDTO {
  bestMarkets: ShahryarReportRankedMetricDTO[];
  mostActiveSupervisors: ShahryarReportRankedMetricDTO[];
  districtComparisons: ShahryarReportDistrictComparisonDTO[];
  salesPaymentTrend: ShahryarReportTrendPointDTO[];
  monthlyGrowth: ShahryarReportMonthlyGrowthDTO;
}

export class ShahryarReportSummaryDTO {
  referenceDate: string;
  activeMarketCount: number;
  activeSupervisorCount: number;
  totalVisits: number;
  totalSalesCartons: number;
  totalRequestedCartons: number;
  totalPaidAmount: number;
  totalPenaltyAmount: number;
  totalAbsences: number;
  backupStatus: {
    label: string;
    lastRunLabel: string;
  };
  rows: ShahryarReportRowDTO[];
  notifications: ShahryarReportNotificationDTO[];
  analytics: ShahryarReportAnalyticsDTO;
}
