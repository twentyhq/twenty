'use client';

import { styled } from '@linaria/react';

import { BarChart } from './BarChart';
import { BAR_DATA, DONUT_VALUE } from './dashboard-visual.data';
import { DonutChart } from './DonutChart';
import {
  BG_DARK,
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';

const Window = styled.div`
  background-color: ${BG_DARK};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Topbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_COLOR};
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
  color: ${TEXT_SECONDARY};
  display: flex;
`;

const BreadcrumbText = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 12px;
  letter-spacing: 0.01em;
`;

const BreadcrumbBold = styled.span`
  color: ${TEXT_PRIMARY};
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

const ActionBtn = styled.span`
  align-items: center;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 4px;
  color: ${TEXT_SECONDARY};
  display: flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;
`;

const ActionIcon = styled.span`
  color: ${TEXT_MUTED};
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
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 10px;
  padding: 14px 16px;
`;

const WidgetTitle = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

type DashboardVisualProps = {
  active: boolean;
};

export function DashboardVisual({ active }: DashboardVisualProps) {
  return (
    <Window>
      <Topbar>
        <BreadcrumbNav>
          <BreadcrumbIcon>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </BreadcrumbIcon>
          <BreadcrumbText>Dashboard /</BreadcrumbText>
          <BreadcrumbBold>Sales performances</BreadcrumbBold>
        </BreadcrumbNav>
        <TopbarActions>
          <ActionBtn>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </ActionBtn>
          <ActionIcon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </ActionIcon>
          <ActionBtn>⌘K</ActionBtn>
        </TopbarActions>
      </Topbar>
      <Body>
        <DonutChart active={active} value={DONUT_VALUE} />
        <BarChartCell>
          <BarChart active={active} data={BAR_DATA} />
        </BarChartCell>
        <BottomPanel>
          <WidgetTitle>Widget name</WidgetTitle>
        </BottomPanel>
      </Body>
    </Window>
  );
}
