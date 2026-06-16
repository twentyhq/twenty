'use client';

import { styled } from '@linaria/react';
import {
  IconDotsVertical,
  IconLayoutGrid,
  IconTrash,
} from '@tabler/icons-react';

import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

import { BarChart } from './bar-chart';
import { DASHBOARD_VISUAL_DATA } from './dashboard-visual-data';
import { DonutChart } from './donut-chart';

const palette = PRODUCT_FEATURE_PALETTE;

const Window = styled.div`
  background-color: ${palette.background};
  display: flex;
  flex-direction: column;
  font-family: ${palette.font};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Topbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${palette.borderLight};
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
  color: ${palette.textSecondary};
  display: flex;
`;

const BreadcrumbText = styled.span`
  color: ${palette.textSecondary};
  font-size: 12px;
  letter-spacing: 0.01em;
`;

const BreadcrumbBold = styled.span`
  color: ${palette.textPrimary};
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
  border: 1px solid ${palette.border};
  border-radius: 4px;
  color: ${palette.textSecondary};
  display: flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;
`;

const ActionIcon = styled.span`
  color: ${palette.textTertiary};
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
  background-color: ${palette.background};
  border: 1px solid ${palette.border};
  border-radius: 10px;
  box-shadow: ${palette.shadow.light};
  padding: 14px 16px;
`;

const WidgetTitle = styled.span`
  color: ${palette.textSecondary};
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
            <IconLayoutGrid size={14} stroke={1.6} />
          </BreadcrumbIcon>
          <BreadcrumbText>Dashboard /</BreadcrumbText>
          <BreadcrumbBold>Sales performances</BreadcrumbBold>
        </BreadcrumbNav>
        <TopbarActions>
          <ActionButton>
            <IconTrash size={12} stroke={1.6} />
            Delete
          </ActionButton>
          <ActionIcon>
            <IconDotsVertical size={14} stroke={1.6} />
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
