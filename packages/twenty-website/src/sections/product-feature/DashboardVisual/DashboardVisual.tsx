'use client';

import { styled } from '@linaria/react';
import { IconDotsVertical, IconLayoutDashboard } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { mediaUp } from '@/tokens';

import { BarChart } from './components/BarChart';
import { DonutChart } from './components/DonutChart';
import { KpiCard } from './components/KpiCard';
import { DASHBOARD_VISUAL_DATA } from './data/dashboard-visual-data';

const Window = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
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
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};

  ${mediaUp('md')} {
    font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  }
`;

const BreadcrumbCurrent = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};

  ${mediaUp('md')} {
    font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  }
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
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 12px;
`;

const KpiRow = styled.div`
  display: grid;
  flex-shrink: 0;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);

  & > :nth-child(3) {
    display: none;
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, 1fr);

    & > :nth-child(3) {
      display: flex;
    }
  }
`;

const ChartRow = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  min-height: 0;
`;

const WidgetCard = styled.div`
  background-color: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.light};
  border-radius: ${THEME_LIGHT.border.radius.md};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  padding: 8px;

  &[data-cell='bar'] {
    flex: 1;
  }
  &[data-cell='donut'] {
    display: none;
  }

  ${mediaUp('md')} {
    &[data-cell='bar'] {
      flex: 1.4;
    }
    &[data-cell='donut'] {
      display: flex;
      flex: 1;
    }
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
        <KpiRow>
          {DASHBOARD_VISUAL_DATA.kpis.map((kpi) => (
            <WidgetCard key={kpi.label}>
              <KpiCard kpi={kpi} />
            </WidgetCard>
          ))}
        </KpiRow>
        <ChartRow>
          <WidgetCard data-cell="bar">
            <WidgetHeader>Deals by month</WidgetHeader>
            <BarChart active={active} months={DASHBOARD_VISUAL_DATA.byMonth} />
          </WidgetCard>
          <WidgetCard data-cell="donut">
            <WidgetHeader>Deals by stage</WidgetHeader>
            <DonutChart active={active} stages={DASHBOARD_VISUAL_DATA.stages} />
          </WidgetCard>
        </ChartRow>
      </Body>
    </Window>
  );
}
