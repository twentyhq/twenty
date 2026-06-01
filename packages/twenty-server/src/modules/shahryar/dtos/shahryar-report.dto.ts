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
}
