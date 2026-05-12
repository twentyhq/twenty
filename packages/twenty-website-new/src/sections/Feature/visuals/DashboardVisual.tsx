'use client';

import { styled } from '@linaria/react';

import { BarChart } from './BarChart';
import { BAR_DATA, DONUT_VALUE } from './dashboard-visual.data';
import { DonutChart } from './DonutChart';
import { WindowChrome } from './WindowChrome';

const Body = styled.div`
  display: grid;
  flex: 1;
  gap: 12px;
  grid-template-columns: 200px 1fr;
  min-height: 0;
  padding: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

type DashboardVisualProps = {
  active: boolean;
};

export function DashboardVisual({ active }: DashboardVisualProps) {
  return (
    <WindowChrome
      breadcrumb="Dashboard"
      breadcrumbBold="Sales performance"
      title="Apple"
    >
      <Body>
        <DonutChart active={active} value={DONUT_VALUE} />
        <BarChart active={active} data={BAR_DATA} />
      </Body>
    </WindowChrome>
  );
}
