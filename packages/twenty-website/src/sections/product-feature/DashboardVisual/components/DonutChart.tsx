'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { EASING } from '@/tokens';

import { type DashboardStage } from '../types/dashboard-stage';

const SIZE = 96;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Root = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
  min-height: 0;
`;

const ChartArea = styled.div`
  flex-shrink: 0;
  position: relative;
`;

const Ring = styled.svg`
  display: block;
  transform-origin: center;
  transition:
    opacity 0.5s ${EASING.standard},
    transform 0.5s ${EASING.standard};
`;

const Slice = styled.circle`
  fill: none;
  stroke-linecap: butt;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.1);
  }

  &[data-tone='blue'] {
    stroke: ${THEME_LIGHT.color.blue8};
  }
  &[data-tone='purple'] {
    stroke: ${THEME_LIGHT.color.purple8};
  }
  &[data-tone='turquoise'] {
    stroke: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-tone='orange'] {
    stroke: ${THEME_LIGHT.color.orange8};
  }
`;

const Center = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const CenterValue = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xl)};
  font-variant-numeric: tabular-nums;
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  line-height: 1;
`;

const CenterLabel = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
  margin-top: 2px;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const LegendRow = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const LegendDot = styled.span`
  border-radius: ${THEME_LIGHT.border.radius.xs};
  flex-shrink: 0;
  height: 8px;
  width: 8px;

  &[data-tone='blue'] {
    background-color: ${THEME_LIGHT.color.blue8};
  }
  &[data-tone='purple'] {
    background-color: ${THEME_LIGHT.color.purple8};
  }
  &[data-tone='turquoise'] {
    background-color: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-tone='orange'] {
    background-color: ${THEME_LIGHT.color.orange8};
  }
`;

const LegendLabel = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const LegendValue = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-variant-numeric: tabular-nums;
`;

export function DonutChart({
  active,
  stages,
  values,
}: {
  active: boolean;
  stages: DashboardStage[];
  values: number[];
}) {
  const total = values.reduce((sum, value) => sum + value, 0);

  let cumulative = 0;
  const slices = stages.map((stage, stageNumber) => {
    const value = values[stageNumber];
    const arc = (value / total) * CIRCUMFERENCE;
    const startAngle = -90 + (cumulative / total) * 360;
    cumulative += value;
    return { arc, stage, startAngle, value };
  });

  return (
    <Root>
      <ChartArea>
        <Ring
          height={SIZE}
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'scale(1)' : 'scale(0.85)',
          }}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
        >
          {slices.map(({ arc, stage, startAngle }) => (
            <Slice
              key={stage.label}
              cx={CENTER}
              cy={CENTER}
              data-tone={stage.tone}
              r={RADIUS}
              strokeDasharray={`${arc} ${CIRCUMFERENCE - arc}`}
              strokeWidth={STROKE}
              transform={`rotate(${startAngle} ${CENTER} ${CENTER})`}
            />
          ))}
        </Ring>
        <Center>
          <CenterValue>{total}</CenterValue>
          <CenterLabel>Deals</CenterLabel>
        </Center>
      </ChartArea>
      <Legend>
        {slices.map(({ stage, value }) => (
          <LegendRow key={stage.label}>
            <LegendDot data-tone={stage.tone} />
            <LegendLabel>{stage.label}</LegendLabel>
            <LegendValue>{value}</LegendValue>
          </LegendRow>
        ))}
      </Legend>
    </Root>
  );
}
