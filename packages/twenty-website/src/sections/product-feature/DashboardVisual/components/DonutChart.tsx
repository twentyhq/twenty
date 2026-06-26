'use client';

import { styled } from '@linaria/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { EASING } from '@/tokens';

import { type DashboardStage } from '../types/dashboard-stage';

const SIZE = 160;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = CIRCUMFERENCE * 0.008;
const LEGEND_PAGE_SIZE = 3;

const Root = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  min-height: 0;
`;

const ChartArea = styled.div`
  aspect-ratio: 1;
  max-height: 100%;
  max-width: ${SIZE}px;
  min-height: 0;
  position: relative;
  width: 100%;
`;

const Ring = styled.svg`
  display: block;
  height: 100%;
  transform-origin: center;
  transition:
    opacity 0.5s ${EASING.standard},
    transform 0.5s ${EASING.standard};
  width: 100%;
`;

const Slice = styled.circle`
  fill: none;
  stroke-linecap: butt;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.1);
  }

  &[data-tone='red'] {
    stroke: ${THEME_LIGHT.color.red8};
  }
  &[data-tone='purple'] {
    stroke: ${THEME_LIGHT.color.purple8};
  }
  &[data-tone='sky'] {
    stroke: ${THEME_LIGHT.color.sky8};
  }
  &[data-tone='turquoise'] {
    stroke: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-tone='yellow'] {
    stroke: ${THEME_LIGHT.color.yellow8};
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
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
  margin-top: 2px;
`;

const Legend = styled.div`
  align-items: center;
  display: flex;
  gap: 48px;
  overflow: hidden;
  width: 100%;
`;

const Pager = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 2px;
`;

const PagerArrow = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  cursor: pointer;
  display: inline-flex;
  transition: color 0.15s ease;

  &:hover {
    color: ${THEME_LIGHT.font.color.secondary};
  }
`;

const PagerText = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-variant-numeric: tabular-nums;
`;

const Item = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 5px;
`;

const ItemDot = styled.span`
  border-radius: ${THEME_LIGHT.border.radius.xs};
  flex-shrink: 0;
  height: 9px;
  width: 9px;

  &[data-tone='red'] {
    background-color: ${THEME_LIGHT.color.red8};
  }
  &[data-tone='purple'] {
    background-color: ${THEME_LIGHT.color.purple8};
  }
  &[data-tone='sky'] {
    background-color: ${THEME_LIGHT.color.sky8};
  }
  &[data-tone='turquoise'] {
    background-color: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-tone='yellow'] {
    background-color: ${THEME_LIGHT.color.yellow8};
  }
`;

const ItemLabel = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  white-space: nowrap;
`;

export function DonutChart({
  active,
  stages,
}: {
  active: boolean;
  stages: DashboardStage[];
}) {
  const [page, setPage] = useState(0);
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  const pageCount = Math.ceil(stages.length / LEGEND_PAGE_SIZE);
  const visibleStages = stages.slice(
    page * LEGEND_PAGE_SIZE,
    page * LEGEND_PAGE_SIZE + LEGEND_PAGE_SIZE,
  );

  let cumulative = 0;
  const slices = stages.map((stage) => {
    const arc = (stage.value / total) * CIRCUMFERENCE;
    const startAngle = -90 + (cumulative / total) * 360;
    cumulative += stage.value;
    return { arc, stage, startAngle };
  });

  return (
    <Root>
      <ChartArea>
        <Ring
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'scale(1)' : 'scale(0.85)',
          }}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {slices.map(({ arc, stage, startAngle }) => {
            const visibleArc = Math.max(arc - GAP, 0.5);
            return (
              <Slice
                key={stage.label}
                cx={CENTER}
                cy={CENTER}
                data-tone={stage.tone}
                r={RADIUS}
                strokeDasharray={`${visibleArc} ${CIRCUMFERENCE - visibleArc}`}
                strokeWidth={STROKE}
                transform={`rotate(${startAngle} ${CENTER} ${CENTER})`}
              />
            );
          })}
        </Ring>
        <Center>
          <CenterValue>{total}</CenterValue>
          <CenterLabel>Total</CenterLabel>
        </Center>
      </ChartArea>
      <Legend>
        <Pager>
          <PagerArrow
            onClick={() =>
              setPage((current) => (current - 1 + pageCount) % pageCount)
            }
          >
            <IconChevronLeft size={14} stroke={1.8} />
          </PagerArrow>
          <PagerText>
            {page + 1}/{pageCount}
          </PagerText>
          <PagerArrow
            onClick={() => setPage((current) => (current + 1) % pageCount)}
          >
            <IconChevronRight size={14} stroke={1.8} />
          </PagerArrow>
        </Pager>
        {visibleStages.map((stage) => (
          <Item key={stage.label}>
            <ItemDot data-tone={stage.tone} />
            <ItemLabel>{stage.label}</ItemLabel>
          </Item>
        ))}
      </Legend>
    </Root>
  );
}
