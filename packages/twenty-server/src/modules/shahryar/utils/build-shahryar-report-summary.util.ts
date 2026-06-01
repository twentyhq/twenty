import {
  type ShahryarReportPeriod,
  type ShahryarReportSummaryDTO,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';
import { type ShahryarReportSource } from 'src/modules/shahryar/types/shahryar-report-source.type';

const PERIODS = ['daily', 'weekly', 'monthly'] as const;

const toDateKey = (isoDate: string): string => isoDate.slice(0, 10);

const isSameMonth = (isoDate: string, referenceDate: string): boolean =>
  isoDate.slice(0, 7) === referenceDate.slice(0, 7);

const daysBetween = (dateKey: string, referenceDate: string): number => {
  const date = Date.parse(`${dateKey}T00:00:00.000Z`);
  const reference = Date.parse(`${referenceDate}T00:00:00.000Z`);

  return Math.floor((reference - date) / 86_400_000);
};

const isInPeriod = ({
  dateKey,
  period,
  referenceDate,
}: {
  dateKey: string;
  period: ShahryarReportPeriod;
  referenceDate: string;
}): boolean => {
  if (period === 'daily') {
    return dateKey === referenceDate;
  }

  if (period === 'weekly') {
    const distance = daysBetween(dateKey, referenceDate);

    return distance >= 0 && distance < 7;
  }

  return isSameMonth(dateKey, referenceDate);
};

const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

export const buildShahryarReportSummary = (
  source: ShahryarReportSource,
): ShahryarReportSummaryDTO => {
  const marketById = new Map(
    source.markets.map((market) => [market.id, market]),
  );
  const supervisorById = new Map(
    source.supervisors.map((supervisor) => [supervisor.id, supervisor]),
  );
  const referenceDate = source.referenceDate;
  const activeSupervisorCount = source.supervisors.filter(
    (supervisor) => supervisor.isActive,
  ).length;
  const activeMarketCount = source.markets.filter(
    (market) => market.isActive,
  ).length;

  const rows = PERIODS.map((period) => {
    const visits = source.visits.filter((visit) =>
      isInPeriod({
        dateKey: toDateKey(visit.visitedAt),
        period,
        referenceDate,
      }),
    );
    const payments = source.payments.filter((payment) =>
      isInPeriod({
        dateKey: toDateKey(payment.paidAt),
        period,
        referenceDate,
      }),
    );
    const penalties = source.penalties.filter((penalty) =>
      isInPeriod({
        dateKey: toDateKey(penalty.issuedAt),
        period,
        referenceDate,
      }),
    );
    const absences = source.absences.filter((absence) =>
      isInPeriod({
        dateKey: absence.absenceDate,
        period,
        referenceDate,
      }),
    );
    const salesCartons = sum(visits.map((visit) => visit.soldCartons));
    const requestedCartons = sum(visits.map((visit) => visit.requestedCartons));
    const paidAmount = sum(payments.map((payment) => payment.amount));
    const penaltyAmount = sum(penalties.map((penalty) => penalty.amount));

    return {
      period,
      label:
        period === 'daily'
          ? referenceDate
          : period === 'weekly'
            ? 'Last 7 days'
            : referenceDate.slice(0, 7),
      visits: visits.length,
      salesCartons,
      requestedCartons,
      paidAmount,
      penaltyAmount,
      absenceCount: absences.length,
      primaryInsight: `${visits.length} visits across ${activeMarketCount} active markets`,
      secondaryInsight: `${activeSupervisorCount} active supervisors, ${requestedCartons} requested cartons`,
      notes: visits
        .filter((visit) => visit.issue !== 'No blocker')
        .map((visit) => {
          const marketName = marketById.get(visit.marketId)?.name ?? 'Market';
          const supervisorName =
            supervisorById.get(visit.supervisorId)?.name ?? 'Supervisor';

          return `${marketName}: ${visit.issue} (${supervisorName})`;
        }),
    };
  });

  const todayWorkingTimes = source.workingTimes.filter(
    (workingTime) => workingTime.workDate === referenceDate,
  );
  const todayVisitMarketIds = new Set(
    source.visits
      .filter((visit) => toDateKey(visit.visitedAt) === referenceDate)
      .map((visit) => visit.marketId),
  );
  const notifications = [
    ...todayWorkingTimes
      .filter((workingTime) => workingTime.reportSubmittedAt === undefined)
      .map((workingTime) => {
        const supervisor = supervisorById.get(workingTime.supervisorId);
        const supervisorName = supervisor?.name ?? 'Supervisor';

        return {
          id: `missing-report-${workingTime.supervisorId}-${referenceDate}`,
          kind: 'missing-report' as const,
          severity: 'warning' as const,
          supervisorId: workingTime.supervisorId,
          supervisorName,
          message: `${supervisorName} has not submitted the daily report for ${referenceDate}`,
        };
      }),
    ...source.markets
      .filter(
        (market) =>
          market.isActive &&
          market.expectedVisitCadence === 'daily' &&
          !todayVisitMarketIds.has(market.id),
      )
      .map((market) => {
        const supervisor = supervisorById.get(market.assignedSupervisorId);
        const supervisorName = supervisor?.name ?? 'Supervisor';

        return {
          id: `missed-visit-${market.id}-${referenceDate}`,
          kind: 'missed-visit' as const,
          severity: 'critical' as const,
          supervisorId: market.assignedSupervisorId,
          supervisorName,
          marketId: market.id,
          marketName: market.name,
          message: `${market.name} has no recorded visit for ${referenceDate}`,
        };
      }),
  ];

  return {
    referenceDate,
    activeMarketCount,
    activeSupervisorCount,
    totalVisits: source.visits.length,
    totalSalesCartons: sum(source.visits.map((visit) => visit.soldCartons)),
    totalRequestedCartons: sum(
      source.visits.map((visit) => visit.requestedCartons),
    ),
    totalPaidAmount: sum(source.payments.map((payment) => payment.amount)),
    totalPenaltyAmount: sum(source.penalties.map((penalty) => penalty.amount)),
    totalAbsences: source.absences.length,
    backupStatus: source.backupStatus,
    rows,
    notifications,
  };
};
