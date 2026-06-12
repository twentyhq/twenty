'use client';

import { styled } from '@linaria/react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

import { BarChart } from './bar-chart';
import { DASHBOARD_VISUAL_DATA } from './dashboard-visual-data';
import { DonutChart } from './donut-chart';

const scene = PRODUCT_FEATURE_SCENE.window;

const Window = styled.div`
  background-color: ${scene.background};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Topbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${scene.border};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px 16px;
`;

const BreadcrumbNav = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const BreadcrumbIcon = styled.span`
  align-items: center;
  color: ${scene.textSecondary};
  display: flex;
`;

const BreadcrumbText = styled.span`
  color: ${scene.textSecondary};
  font-size: 12px;
  letter-spacing: 0.01em;
`;

const BreadcrumbBold = styled.span`
  color: ${scene.textPrimary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const TopbarActions = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ActionButton = styled.span`
  align-items: center;
  border: 1px solid ${scene.border};
  border-radius: 4px;
  color: ${scene.textSecondary};
  display: flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;
`;

const ActionIcon = styled.span`
  color: ${scene.textMuted};
  display: flex;
`;

const Body = styled.div`
  display: grid;
  flex: 1;
  gap: 12px;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr 60px;
  min-height: 0;
  padding: 14px;
`;

const BarChartCell = styled.div`
  grid-column: 2;
  grid-row: 1 / -1;
  min-height: 0;
`;

const BottomPanel = styled.div`
  background-color: ${scene.panelBackground};
  border: 1px solid ${scene.border};
  border-radius: 10px;
  padding: 14px 16px;
`;

const WidgetTitle = styled.span`
  color: ${scene.textSecondary};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

// The spotlight visual: charts animate in when the tile becomes active.
export function DashboardVisual({ active }: { active: boolean }) {
  return (
    <Window>
      <Topbar>
        <BreadcrumbNav>
          <BreadcrumbIcon>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="14"
            >
              <rect height="7" width="7" x="3" y="3" />
              <rect height="7" width="7" x="14" y="3" />
              <rect height="7" width="7" x="3" y="14" />
              <rect height="7" width="7" x="14" y="14" />
            </svg>
          </BreadcrumbIcon>
          <BreadcrumbText>Dashboard /</BreadcrumbText>
          <BreadcrumbBold>Sales performances</BreadcrumbBold>
        </BreadcrumbNav>
        <TopbarActions>
          <ActionButton>
            <svg
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="12"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </ActionButton>
          <ActionIcon>
            <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </ActionIcon>
          <ActionButton>⌘K</ActionButton>
        </TopbarActions>
      </Topbar>
      <Body>
        <DonutChart active={active} value={DASHBOARD_VISUAL_DATA.donutValue} />
        <BarChartCell>
          <BarChart active={active} data={DASHBOARD_VISUAL_DATA.barData} />
        </BarChartCell>
        <BottomPanel>
          <WidgetTitle>Widget name</WidgetTitle>
        </BottomPanel>
      </Body>
    </Window>
  );
}
