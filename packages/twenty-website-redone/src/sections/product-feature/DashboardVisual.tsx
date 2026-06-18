'use client';

import { styled } from '@linaria/react';
import {
  IconDotsVertical,
  IconLayoutDashboard,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { BarChart } from './BarChart';
import { DASHBOARD_VISUAL_DATA } from './dashboard-visual-data';
import { DonutChart } from './DonutChart';

const Window = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Topbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
`;

const Breadcrumb = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const BreadcrumbIcon = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
`;

const BreadcrumbText = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const BreadcrumbCurrent = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
`;

const Actions = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const IconButton = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  justify-content: center;
  padding: 4px;
`;

const SearchChip = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.light};
  display: inline-flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  padding: 4px 8px;
`;

const Body = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: grid;
  flex: 1;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr;
  min-height: 0;
  padding: 12px;
`;

const WidgetCard = styled.div`
  background-color: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.light};
  border-radius: ${THEME_LIGHT.border.radius.md};
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px;

  &[data-cell='bar'] {
    grid-column: 1 / 3;
    grid-row: 2;
  }
  &[data-cell='donut'] {
    grid-column: 3;
    grid-row: 2;
  }
`;

const WidgetHeader = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  flex-shrink: 0;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  height: 24px;
`;

const KpiBody = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
`;

const KpiValue = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xxl)};
  font-variant-numeric: tabular-nums;
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  line-height: 1.1;
`;

const KpiTrend = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 2px;
`;

const TrendIcon = styled.span`
  align-items: center;
  display: inline-flex;

  &[data-direction='up'] {
    color: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-direction='down'] {
    color: ${THEME_LIGHT.color.red8};
  }
`;

const TrendPercent = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
`;

// The spotlight visual: a page-layout dashboard on twenty-front's WidgetCard
// chrome (secondary card floating on the tertiary canvas). KPI cards plus a
// bar widget and a donut widget; the charts animate in when the tile is active.
export function DashboardVisual({ active }: { active: boolean }) {
  return (
    <Window>
      <Topbar>
        <Breadcrumb>
          <BreadcrumbIcon>
            <IconLayoutDashboard size={16} stroke={2} />
          </BreadcrumbIcon>
          <BreadcrumbText>Dashboards /</BreadcrumbText>
          <BreadcrumbCurrent>Sales performance</BreadcrumbCurrent>
        </Breadcrumb>
        <Actions>
          <IconButton>
            <IconDotsVertical size={16} stroke={2} />
          </IconButton>
          <SearchChip>⌘K</SearchChip>
        </Actions>
      </Topbar>
      <Body>
        {DASHBOARD_VISUAL_DATA.kpis.map((kpi) => (
          <WidgetCard key={kpi.label}>
            <WidgetHeader>{kpi.label}</WidgetHeader>
            <KpiBody>
              <KpiValue>{kpi.value}</KpiValue>
              <KpiTrend>
                <TrendIcon data-direction={kpi.trendDirection}>
                  {kpi.trendDirection === 'up' ? (
                    <IconTrendingUp size={14} stroke={2} />
                  ) : (
                    <IconTrendingDown size={14} stroke={2} />
                  )}
                </TrendIcon>
                <TrendPercent>{kpi.trendPercent}%</TrendPercent>
              </KpiTrend>
            </KpiBody>
          </WidgetCard>
        ))}
        <WidgetCard data-cell="bar">
          <WidgetHeader>Deals by month</WidgetHeader>
          <BarChart
            active={active}
            months={DASHBOARD_VISUAL_DATA.byMonth}
            stages={DASHBOARD_VISUAL_DATA.stages}
          />
        </WidgetCard>
        <WidgetCard data-cell="donut">
          <WidgetHeader>Deals by stage</WidgetHeader>
          <DonutChart
            active={active}
            stages={DASHBOARD_VISUAL_DATA.stages}
            values={DASHBOARD_VISUAL_DATA.stageTotals}
          />
        </WidgetCard>
      </Body>
    </Window>
  );
}
