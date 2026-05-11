'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { ACCENT, ACCENT_DIM } from './dashboard-visual.data';
import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';

const RADIUS = 46;
const STROKE_WIDTH = 14;
const SIZE = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Panel = styled.div`
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px;
`;

const PanelTitle = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const ChartArea = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  position: relative;
`;

const CenterLabel = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const CenterValue = styled.span`
  color: ${TEXT_PRIMARY};
  font-size: 26px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
`;

const Legend = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const LegendDot = styled.span`
  background-color: ${ACCENT};
  border-radius: 50%;
  height: 7px;
  width: 7px;
`;

const LegendLabel = styled.span`
  color: ${TEXT_MUTED};
  font-size: 10px;
  letter-spacing: 0.02em;
`;

type DonutChartProps = {
  active: boolean;
  value: number;
};

export function DonutChart({ active, value }: DonutChartProps) {
  const [hovered, setHovered] = useState(false);
  const filled = (value / 100) * CIRCUMFERENCE;
  const gap = CIRCUMFERENCE - filled;

  return (
    <Panel>
      <PanelTitle>Conversion rate</PanelTitle>
      <ChartArea>
        <svg height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            stroke={ACCENT_DIM}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            r={RADIUS}
            stroke={ACCENT}
            strokeDasharray={`${filled} ${gap}`}
            strokeDashoffset={active ? CIRCUMFERENCE * 0.25 : CIRCUMFERENCE}
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
            style={{
              cursor: 'pointer',
              filter: hovered ? 'brightness(1.2)' : 'none',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition:
                'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s ease',
            }}
          />
        </svg>
        <CenterLabel>
          <CenterValue>{active ? `${value}%` : '0%'}</CenterValue>
        </CenterLabel>
      </ChartArea>
      <Legend>
        <LegendDot />
        <LegendLabel>Conversion rate</LegendLabel>
      </Legend>
    </Panel>
  );
}
