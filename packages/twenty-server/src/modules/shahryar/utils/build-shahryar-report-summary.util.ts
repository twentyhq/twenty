import {
  type ShahryarReportAnalyticsDTO,
  type ShahryarReportPeriod,
  type ShahryarReportRankedMetricDTO,
  type ShahryarReportSummaryDTO,
  type ShahryarReportTrendPointDTO,
} from 'src/modules/shahryar/dtos/shahryar-report.dto';
import {
  type ShahryarReportMarketRecord,
  type ShahryarReportSource,
} from 'src/modules/shahryar/types/shahryar-report-source.type';

const PERIODS = ['daily', 'weekly', 'monthly'] as const;
const RANKED_METRIC_LIMIT = 5;
const TREND_MONTH_COUNT = 6;
const UNKNOWN_DISTRICT_LABEL = 'Unassigned';

const toDateKey = (isoDate: string): string => isoDate.slice(0, 10);

const toMonthKey = (isoDate: string): string => isoDate.slice(0, 7);

const isSameMonth = (isoDate: string, referenceDate: string): boolean =>
  toMonthKey(isoDate) === toMonthKey(referenceDate);

const toUtcMonthDate = (monthKey: string): Date =>
  new Date(`${monthKey}-01T00:00:00.000Z`);

const shiftMonthKey = (monthKey: string, monthOffset: number): string => {
  const date = toUtcMonthDate(monthKey);

  date.setUTCMonth(date.getUTCMonth() + monthOffset);

  return date.toISOString().slice(0, 7);
};

const getTrendMonthKeys = (referenceDate: string): string[] => {
  const referenceMonthKey = toMonthKey(referenceDate);

  return Array.from({ length: TREND_MONTH_COUNT }, (_, index) =>
    shiftMonthKey(referenceMonthKey, index - (TREND_MONTH_COUNT - 1)),
  );
};

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

const toGrowthPercent = ({
  currentValue,
  previousValue,
}: {
  currentValue: number;
  previousValue: number;
}): number => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
};

const getMarketDistrict = (
  market: ShahryarReportMarketRecord | undefined,
): string => {
  const district = market?.district?.trim();

  return district === undefined || district.length === 0
    ? UNKNOWN_DISTRICT_LABEL
    : district;
};

const toRankedMetrics = (
  metricById: Map<
    string,
    {
      label: string;
      value: number;
      secondaryLabel: string;
      secondaryValue: number;
    }
  >,
): ShahryarReportRankedMetricDTO[] =>
  [...metricById.entries()]
    .map(([id, metric]) => ({
      id,
      ...metric,
    }))
    .sort((metricA, metricB) => {
      if (metricB.value !== metricA.value) {
        return metricB.value - metricA.value;
      }

      return metricA.label.localeCompare(metricB.label);
    })
    .slice(0, RANKED_METRIC_LIMIT);

const buildBestMarkets = ({
  marketById,
  source,
}: {
  marketById: Map<string, ShahryarReportMarketRecord>;
  source: ShahryarReportSource;
}): ShahryarReportRankedMetricDTO[] => {
  const metricByMarketId = new Map<
    string,
    {
      label: string;
      value: number;
      secondaryLabel: string;
      secondaryValue: number;
    }
  >();

  for (const visit of source.visits) {
    const market = marketById.get(visit.marketId);
    const previousMetric = metricByMarketId.get(visit.marketId);

    metricByMarketId.set(visit.marketId, {
      label: market?.name ?? visit.marketId,
      value: (previousMetric?.value ?? 0) + visit.soldCartons,
      secondaryLabel: 'visits',
      secondaryValue: (previousMetric?.secondaryValue ?? 0) + 1,
    });
  }

  return toRankedMetrics(metricByMarketId);
};

const buildMostActiveSupervisors = (
  source: ShahryarReportSource,
): ShahryarReportRankedMetricDTO[] => {
  const supervisorById = new Map(
    source.supervisors.map((supervisor) => [supervisor.id, supervisor]),
  );
  const metricBySupervisorId = new Map<
    string,
    {
      label: string;
      value: number;
      secondaryLabel: string;
      secondaryValue: number;
    }
  >();

  for (const visit of source.visits) {
    const supervisor = supervisorById.get(visit.supervisorId);
    const previousMetric = metricBySupervisorId.get(visit.supervisorId);

    metricBySupervisorId.set(visit.supervisorId, {
      label: supervisor?.name ?? visit.supervisorId,
      value: (previousMetric?.value ?? 0) + 1,
      secondaryLabel: 'sold cartons',
      secondaryValue: (previousMetric?.secondaryValue ?? 0) + visit.soldCartons,
    });
  }

  return toRankedMetrics(metricBySupervisorId);
};

const buildDistrictComparisons = ({
  marketById,
  source,
}: {
  marketById: Map<string, ShahryarReportMarketRecord>;
  source: ShahryarReportSource;
}): ShahryarReportAnalyticsDTO['districtComparisons'] => {
  const metricByDistrict = new Map<
    string,
    {
      activeMarketCount: number;
      visitCount: number;
      salesCartons: number;
      paidAmount: number;
    }
  >();
  const ensureDistrictMetric = (district: string) => {
    const existingMetric = metricByDistrict.get(district);

    if (existingMetric !== undefined) {
      return existingMetric;
    }

    const emptyMetric = {
      activeMarketCount: 0,
      visitCount: 0,
      salesCartons: 0,
      paidAmount: 0,
    };

    metricByDistrict.set(district, emptyMetric);

    return emptyMetric;
  };

  for (const market of source.markets) {
    const district = getMarketDistrict(market);
    const metric = ensureDistrictMetric(district);

    if (market.isActive) {
      metric.activeMarketCount += 1;
    }
  }

  for (const visit of source.visits) {
    const district = getMarketDistrict(marketById.get(visit.marketId));
    const metric = ensureDistrictMetric(district);

    metric.visitCount += 1;
    metric.salesCartons += visit.soldCartons;
  }

  for (const payment of source.payments) {
    const district = getMarketDistrict(marketById.get(payment.marketId));
    const metric = ensureDistrictMetric(district);

    metric.paidAmount += payment.amount;
  }

  return [...metricByDistrict.entries()]
    .map(([district, metric]) => ({
      district,
      ...metric,
    }))
    .sort((districtA, districtB) => {
      if (districtB.salesCartons !== districtA.salesCartons) {
        return districtB.salesCartons - districtA.salesCartons;
      }

      return districtA.district.localeCompare(districtB.district);
    });
};

const buildSalesPaymentTrend = (
  source: ShahryarReportSource,
): ShahryarReportTrendPointDTO[] =>
  getTrendMonthKeys(source.referenceDate).map((monthKey) => {
    const visits = source.visits.filter(
      (visit) => toMonthKey(visit.visitedAt) === monthKey,
    );
    const payments = source.payments.filter(
      (payment) => toMonthKey(payment.paidAt) === monthKey,
    );

    return {
      date: monthKey,
      label: monthKey,
      visits: visits.length,
      salesCartons: sum(visits.map((visit) => visit.soldCartons)),
      requestedCartons: sum(visits.map((visit) => visit.requestedCartons)),
      paidAmount: sum(payments.map((payment) => payment.amount)),
    };
  });

const buildMonthlyGrowth = (
  source: ShahryarReportSource,
): ShahryarReportAnalyticsDTO['monthlyGrowth'] => {
  const currentMonthKey = toMonthKey(source.referenceDate);
  const previousMonthKey = shiftMonthKey(currentMonthKey, -1);
  const currentMonthVisits = source.visits.filter(
    (visit) => toMonthKey(visit.visitedAt) === currentMonthKey,
  );
  const previousMonthVisits = source.visits.filter(
    (visit) => toMonthKey(visit.visitedAt) === previousMonthKey,
  );
  const currentMonthPayments = source.payments.filter(
    (payment) => toMonthKey(payment.paidAt) === currentMonthKey,
  );
  const previousMonthPayments = source.payments.filter(
    (payment) => toMonthKey(payment.paidAt) === previousMonthKey,
  );
  const currentMonthSalesCartons = sum(
    currentMonthVisits.map((visit) => visit.soldCartons),
  );
  const previousMonthSalesCartons = sum(
    previousMonthVisits.map((visit) => visit.soldCartons),
  );
  const currentMonthPaidAmount = sum(
    currentMonthPayments.map((payment) => payment.amount),
  );
  const previousMonthPaidAmount = sum(
    previousMonthPayments.map((payment) => payment.amount),
  );

  return {
    currentMonthSalesCartons,
    previousMonthSalesCartons,
    salesGrowthPercent: toGrowthPercent({
      currentValue: currentMonthSalesCartons,
      previousValue: previousMonthSalesCartons,
    }),
    currentMonthPaidAmount,
    previousMonthPaidAmount,
    paymentGrowthPercent: toGrowthPercent({
      currentValue: currentMonthPaidAmount,
      previousValue: previousMonthPaidAmount,
    }),
  };
};

const buildAnalytics = ({
  marketById,
  source,
}: {
  marketById: Map<string, ShahryarReportMarketRecord>;
  source: ShahryarReportSource;
}): ShahryarReportAnalyticsDTO => ({
  bestMarkets: buildBestMarkets({ marketById, source }),
  mostActiveSupervisors: buildMostActiveSupervisors(source),
  districtComparisons: buildDistrictComparisons({ marketById, source }),
  salesPaymentTrend: buildSalesPaymentTrend(source),
  monthlyGrowth: buildMonthlyGrowth(source),
});

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
    analytics: buildAnalytics({
      marketById,
      source,
    }),
  };
};
