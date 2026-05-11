import type { DashboardChartImage, DashboardPageDefinition } from '../../types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { VISUAL_TOKENS } from '../../Shared/utils/app-preview-tokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const CARD_BACKGROUND = VISUAL_TOKENS.background.secondary;
const CARD_BORDER = VISUAL_TOKENS.border.color.light;

const DashboardGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-areas:
    'metrics'
    'visits'
    'revenue'
    'distribution';
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  padding: 8px;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-areas:
      'metrics visits visits'
      'revenue revenue distribution';
    grid-template-columns: minmax(168px, 252px) minmax(0, 1fr) minmax(
        168px,
        252px
      );
  }
`;

const MetricStack = styled.div`
  align-self: stretch;
  display: grid;
  gap: 8px;
  grid-area: metrics;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }
`;

const MetricCard = styled.div`
  background: ${CARD_BACKGROUND};
  border: 1px solid ${CARD_BORDER};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: space-between;
  min-height: 92px;
  padding: 12px;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 0;
  }
`;

const MetricTitle = styled.span`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
`;

const MetricValue = styled.span`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-family: ${APP_FONT};
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
`;

const VisitsChart = styled.div`
  grid-area: visits;
  min-width: 0;
`;

const RevenueChart = styled.div`
  grid-area: revenue;
  min-width: 0;
`;

const DistributionChart = styled.div`
  grid-area: distribution;
  min-width: 0;
`;

const ChartImage = styled.img`
  display: block;
  height: auto;
  max-width: 100%;
  width: 100%;
`;

function DashboardChart({
  chart,
  className,
}: {
  chart: DashboardChartImage;
  className?: string;
}) {
  return (
    <ChartImage
      alt={chart.alt}
      className={className}
      height={chart.height}
      loading="eager"
      src={chart.src}
      width={chart.width}
    />
  );
}

export function SalesDashboardPage({
  page,
}: {
  page: DashboardPageDefinition;
}) {
  return (
    <DashboardGrid>
      <MetricStack>
        {page.dashboard.metrics.map((metric) => (
          <MetricCard key={metric.id}>
            <MetricTitle>{metric.title}</MetricTitle>
            <MetricValue>{metric.value}</MetricValue>
          </MetricCard>
        ))}
      </MetricStack>

      <VisitsChart>
        <DashboardChart chart={page.dashboard.visitsChart} />
      </VisitsChart>

      <RevenueChart>
        <DashboardChart chart={page.dashboard.revenueChart} />
      </RevenueChart>

      <DistributionChart>
        <DashboardChart chart={page.dashboard.distributionChart} />
      </DistributionChart>
    </DashboardGrid>
  );
}
