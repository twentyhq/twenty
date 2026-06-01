import { styled } from '@linaria/react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import type { DashboardKpi, DashboardPageDefinition } from '../../types';
import { theme } from '@/theme';
import {
  SkeletonBar,
  SkeletonBlock,
} from '../../Shared/components/PreviewSkeleton';
import { APP_FONT, COLORS } from '../../Shared/utils/app-preview-theme';
import {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from './DashboardCharts';

const TREND_UP_COLOR = '#53b9ab';
const TREND_DOWN_COLOR = '#eb8e90';

const DashboardGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-areas:
    'kpis'
    'line'
    'bar'
    'donut';
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  padding: 8px;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-areas:
      'kpis line line'
      'bar bar donut';
    grid-template-columns: minmax(176px, 248px) minmax(0, 1fr) minmax(
        176px,
        248px
      );
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const WidgetCard = styled.div`
  animation: dashboardWidgetAppear 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.borderLight};
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: hidden;
  padding: 8px;

  @keyframes dashboardWidgetAppear {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const WidgetTitle = styled.span`
  color: ${COLORS.text};
  flex-shrink: 0;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  padding: 0 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const KpiStack = styled.div`
  display: grid;
  gap: 8px;
  grid-area: kpis;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }
`;

const KpiCard = styled(WidgetCard)`
  gap: 6px;
  justify-content: center;
`;

const KpiValueRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const KpiValue = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 25px;
  font-weight: 600;
  line-height: 1.1;
`;

const KpiTrend = styled.span<{ $up: boolean }>`
  align-items: center;
  color: ${({ $up }) => ($up ? TREND_UP_COLOR : TREND_DOWN_COLOR)};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: 500;
  gap: 2px;
`;

const LineCard = styled(WidgetCard)`
  grid-area: line;
`;

const BarCard = styled(WidgetCard)`
  grid-area: bar;
`;

const DonutCard = styled(WidgetCard)`
  grid-area: donut;
`;

function KpiWidget({ kpi }: { kpi: DashboardKpi }) {
  const isUp = kpi.trend?.direction === 'up';

  return (
    <KpiCard>
      <WidgetTitle>{kpi.title}</WidgetTitle>
      <KpiValueRow>
        <KpiValue>{kpi.value}</KpiValue>
        {kpi.trend ? (
          <KpiTrend $up={isUp}>
            {isUp ? (
              <IconTrendingUp size={14} stroke={2} />
            ) : (
              <IconTrendingDown size={14} stroke={2} />
            )}
            {kpi.trend.value}
          </KpiTrend>
        ) : null}
      </KpiValueRow>
    </KpiCard>
  );
}

function KpiSkeleton() {
  return (
    <KpiCard>
      <SkeletonBar $height={11} $width="55%" />
      <SkeletonBar $height={20} $width="45%" />
    </KpiCard>
  );
}

function ChartSkeleton() {
  return (
    <>
      <SkeletonBar $height={11} $width="48%" />
      <SkeletonBlock />
    </>
  );
}

export function SalesDashboardPage({
  page,
}: {
  page: DashboardPageDefinition;
}) {
  const { kpis, lineChart, barChart, donutChart, generating } = page.dashboard;

  return (
    <DashboardGrid>
      {kpis.length > 0 ? (
        <KpiStack>
          {kpis.map((kpi) =>
            generating ? (
              <KpiSkeleton key={kpi.id} />
            ) : (
              <KpiWidget key={kpi.id} kpi={kpi} />
            ),
          )}
        </KpiStack>
      ) : null}

      {lineChart ? (
        <LineCard>
          {generating ? (
            <ChartSkeleton />
          ) : (
            <>
              <WidgetTitle>{lineChart.title}</WidgetTitle>
              <DashboardLineChart data={lineChart} />
            </>
          )}
        </LineCard>
      ) : null}

      {barChart ? (
        <BarCard>
          {generating ? (
            <ChartSkeleton />
          ) : (
            <>
              <WidgetTitle>{barChart.title}</WidgetTitle>
              <DashboardBarChart data={barChart} />
            </>
          )}
        </BarCard>
      ) : null}

      {donutChart ? (
        <DonutCard>
          {generating ? (
            <ChartSkeleton />
          ) : (
            <>
              <WidgetTitle>{donutChart.title}</WidgetTitle>
              <DashboardDonutChart data={donutChart} />
            </>
          )}
        </DonutCard>
      ) : null}
    </DashboardGrid>
  );
}
