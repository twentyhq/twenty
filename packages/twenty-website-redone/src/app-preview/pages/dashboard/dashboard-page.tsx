import { styled } from '@linaria/react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { EASING, mediaUp, REDUCED_MOTION } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { DASHBOARD_CHARTS } from './dashboard-charts';
import { PREVIEW_SKELETON } from '../../primitives/preview-skeleton';
import { type DashboardKpi, type DashboardPageDefinition } from '../../types';

const theme = THEME_LIGHT;

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

  ${mediaUp('md')} {
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
  animation: dashboardWidgetAppear 360ms ${EASING.standard} both;
  background: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.light};
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

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const WidgetTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex-shrink: 0;
  font-family: ${theme.font.family};
  font-size: ${previewFontSize(theme.font.size.md)};
  font-weight: ${theme.font.weight.medium};
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

  ${mediaUp('md')} {
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
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${theme.font.family};
  font-size: 25px;
  font-weight: ${theme.font.weight.semiBold};
  line-height: 1.1;
`;

const KpiTrend = styled.span<{ $up: boolean }>`
  align-items: center;
  color: ${({ $up }) =>
    $up
      ? APP_PREVIEW_TONES.dashboardChart.trendUp
      : APP_PREVIEW_TONES.dashboardChart.trendDown};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${theme.font.family};
  font-size: 12px;
  font-weight: ${theme.font.weight.medium};
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
              <IconTrendingUp size={14} stroke={theme.icon.stroke.md} />
            ) : (
              <IconTrendingDown size={14} stroke={theme.icon.stroke.md} />
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
      <PREVIEW_SKELETON.Bar $height={11} $width="55%" />
      <PREVIEW_SKELETON.Bar $height={20} $width="45%" />
    </KpiCard>
  );
}

function ChartSkeleton() {
  return (
    <>
      <PREVIEW_SKELETON.Bar $height={11} $width="48%" />
      <PREVIEW_SKELETON.Block />
    </>
  );
}

export function DashboardPage({ page }: { page: DashboardPageDefinition }) {
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
              <DASHBOARD_CHARTS.Line data={lineChart} />
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
              <DASHBOARD_CHARTS.Bar data={barChart} />
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
              <DASHBOARD_CHARTS.Donut data={donutChart} />
            </>
          )}
        </DonutCard>
      ) : null}
    </DashboardGrid>
  );
}
