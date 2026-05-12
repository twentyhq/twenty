'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { ACCENT } from './dashboard-visual.data';
import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_SECONDARY,
} from './visual-tokens';

const Panel = styled.div`
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 10px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding: 18px 20px;
`;

const PanelTitle = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const BarsArea = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 5px;
  min-height: 0;
  padding-top: 20px;
`;

const BarColumn = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
  position: relative;
`;

const Bar = styled.div`
  border-radius: 3px 3px 0 0;
  cursor: pointer;
  min-height: 2px;
  transition:
    height 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.15s ease;
  width: 80%;
`;

const BarValue = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  position: absolute;
  top: 0;
  transform: translateY(calc(-100% - 4px));
  white-space: nowrap;
`;

const BarLabel = styled.span`
  color: ${TEXT_MUTED};
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

type BarDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  active: boolean;
  data: BarDatum[];
};

export function BarChart({ active, data }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rawMax = Math.max(...data.map((datum) => datum.value));
  const maxValue = rawMax * 1.3;

  return (
    <Panel>
      <PanelTitle>Monthly volume</PanelTitle>
      <BarsArea>
        {data.map((datum, index) => {
          const heightPercent = (datum.value / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <BarColumn key={index}>
              {active ? (
                <BarValue style={{ opacity: isHovered ? 1 : 0.7 }}>
                  {datum.value}
                </BarValue>
              ) : null}
              <Bar
                onPointerEnter={() => setHoveredIndex(index)}
                onPointerLeave={() => setHoveredIndex(null)}
                style={{
                  backgroundColor: ACCENT,
                  filter: isHovered ? 'brightness(1.3)' : 'none',
                  height: active ? `${heightPercent}%` : '0%',
                  transitionDelay: active ? `${index * 50}ms` : '0ms',
                }}
              />
              <BarLabel>{datum.label}</BarLabel>
            </BarColumn>
          );
        })}
      </BarsArea>
    </Panel>
  );
}
