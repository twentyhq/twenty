'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { EASING } from '@/tokens';
import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const scene = PRODUCT_FEATURE_SCENE.window;
const inks = PRODUCT_FEATURE_SCENE.dashboard;

const RADIUS = 46;
const STROKE_WIDTH = 14;
const SIZE = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Panel = styled.div`
  background-color: ${scene.panelBackground};
  border: 1px solid ${scene.border};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px;
`;

const PanelTitle = styled.span`
  color: ${scene.textSecondary};
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
  color: ${scene.textPrimary};
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
  background-color: ${inks.accent};
  border-radius: 50%;
  height: 7px;
  width: 7px;
`;

const LegendLabel = styled.span`
  color: ${scene.textMuted};
  font-size: 10px;
  letter-spacing: 0.02em;
`;

// The ring sweeps in when the tile becomes active; hovering brightens it.
export function DonutChart({
  active,
  value,
}: {
  active: boolean;
  value: number;
}) {
  const [hovered, setHovered] = useState(false);
  const filled = (value / 100) * CIRCUMFERENCE;
  const gap = CIRCUMFERENCE - filled;

  return (
    <Panel>
      <PanelTitle>Widget name</PanelTitle>
      <ChartArea>
        <svg height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            r={RADIUS}
            stroke={inks.accentDim}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            fill="none"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            r={RADIUS}
            stroke={inks.accent}
            strokeDasharray={`${filled} ${gap}`}
            strokeDashoffset={active ? CIRCUMFERENCE * 0.25 : CIRCUMFERENCE}
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
            style={{
              cursor: 'pointer',
              filter: hovered ? 'brightness(1.2)' : 'none',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: `stroke-dashoffset 1.2s ${EASING.standard}, filter 0.2s ease`,
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
