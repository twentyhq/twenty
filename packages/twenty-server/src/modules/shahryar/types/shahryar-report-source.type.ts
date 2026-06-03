export type ShahryarReportSupervisorRecord = {
  id: string;
  name: string;
  isActive: boolean;
};

export type ShahryarReportMarketRecord = {
  id: string;
  name: string;
  assignedSupervisorId: string;
  isActive: boolean;
  expectedVisitCadence: 'daily' | 'weekly';
  ownerName?: string;
  phoneNumber?: string;
  address?: string;
  district?: string;
  gpsLocation?: string;
  paymentStatus?: string;
  balanceAmount?: number;
  photoCount?: number;
  notes?: string;
};

export type ShahryarReportVisitRecord = {
  id: string;
  marketId: string;
  supervisorId: string;
  visitedAt: string;
  gpsLocation?: string;
  soldCartons: number;
  requestedCartons: number;
  issue: string;
  decisionMaker: string;
  photoCount?: number;
  requestDetails: string;
  report: string;
};

export type ShahryarReportWorkingTimeRecord = {
  id: string;
  supervisorId: string;
  workDate: string;
  startedAt: string;
  endedAt?: string;
  gpsLocation?: string;
  totalMinutes?: number;
  status?: string;
  reportSubmittedAt?: string;
};

export type ShahryarReportPaymentRecord = {
  id: string;
  marketId: string;
  collectedById: string;
  paidAt: string;
  amount: number;
  status?: string;
  notes?: string;
};

export type ShahryarReportPenaltyRecord = {
  id: string;
  supervisorId: string;
  issuedAt: string;
  amount: number;
  reason?: string;
  decidedBy?: string;
};

export type ShahryarReportAbsenceRecord = {
  id: string;
  supervisorId: string;
  absenceDate: string;
  reason: string;
  workingTime?: string;
  gpsLocation?: string;
  notes?: string;
};

export type ShahryarReportSource = {
  referenceDate: string;
  supervisors: ShahryarReportSupervisorRecord[];
  markets: ShahryarReportMarketRecord[];
  visits: ShahryarReportVisitRecord[];
  workingTimes: ShahryarReportWorkingTimeRecord[];
  payments: ShahryarReportPaymentRecord[];
  penalties: ShahryarReportPenaltyRecord[];
  absences: ShahryarReportAbsenceRecord[];
  backupStatus: {
    label: string;
    lastRunLabel: string;
  };
};
