'use client';

import { styled } from '@linaria/react';
import { useEffect, useId, useState, type CSSProperties } from 'react';

import { createAnimationFrameLoop } from '@/platform/motion';
import { EASING, REDUCED_MOTION } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import {
  type DashboardBarChart as DashboardBarChartData,
  type DashboardDonutChart as DashboardDonutChartData,
  type DashboardLineChart as DashboardLineChartData,
} from '../../types';

const ACCENT = APP_PREVIEW_TONES.dashboardChart.accent;

const ChartFrame = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const AxisLabel = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 10px;
  line-height: 1;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlotArea = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const Gridlines = styled.div<{ $bottom: number }>`
  bottom: ${({ $bottom }) => `${$bottom}px`};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
`;

const GridLine = styled.span`
  border-top: 1px dashed ${THEME_LIGHT.border.color.light};
  display: block;
  width: 100%;
`;

const GRID_LINES = [0, 1, 2, 3];

const LINE_W = 320;
const LINE_H = 120;
const LINE_PAD = 10;

const LineSvg = styled.svg`
  display: block;
  height: 100%;
  position: relative;
  width: 100%;
  z-index: 1;

  .line-stroke {
    transition: opacity 420ms ease;
  }

  .line-area {
    transition: opacity 500ms ease 160ms;
  }

  ${REDUCED_MOTION} {
    .line-area,
    .line-stroke {
      transition: none;
    }
  }
`;

function DashboardLineChart({ data }: { data: DashboardLineChartData }) {
  const [drawn, setDrawn] = useState(false);
  const gradientId = `dashboard-line-fill-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const task = createAnimationFrameLoop({
      onFrame: () => {
        setDrawn(true);
        return false;
      },
    });
    task.start();
    return () => task.stop();
  }, []);

  const max = Math.max(...data.values);
  const min = Math.min(...data.values);
  const range = max - min || 1;
  const stepX = (LINE_W - LINE_PAD * 2) / (data.values.length - 1);
  const points = data.values.map((value, index) => {
    const x = LINE_PAD + index * stepX;
    const y = LINE_PAD + (LINE_H - LINE_PAD * 2) * (1 - (value - min) / range);
    return [x, y] as [number, number];
  });
  const linePath = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(' ');
  const lastX = points[points.length - 1][0];
  const firstX = points[0][0];
  const areaPath = `${linePath} L${lastX.toFixed(1)} ${LINE_H - LINE_PAD} L${firstX.toFixed(1)} ${LINE_H - LINE_PAD} Z`;

  return (
    <ChartFrame>
      <PlotArea>
        <Gridlines $bottom={0} aria-hidden>
          {GRID_LINES.map((line) => (
            <GridLine key={line} />
          ))}
        </Gridlines>
        <LineSvg
          aria-hidden
          preserveAspectRatio="none"
          viewBox={`0 0 ${LINE_W} ${LINE_H}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="line-area"
            d={areaPath}
            fill={`url(#${gradientId})`}
            style={{ opacity: drawn ? 1 : 0 }}
          />
          <path
            className="line-stroke"
            d={linePath}
            fill="none"
            stroke={ACCENT}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            style={{ opacity: drawn ? 1 : 0 }}
            vectorEffect="non-scaling-stroke"
          />
        </LineSvg>
      </PlotArea>
    </ChartFrame>
  );
}

const BarColumns = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 10px;
  min-height: 0;
  padding-top: 8px;
  position: relative;
  width: 100%;
`;

const BarColumn = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  justify-content: flex-end;
  min-width: 0;
`;

const BarTrack = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const Bar = styled.div<{ $heightPct: number; $index: number }>`
  animation: barGrow 460ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${$index * 90}ms`};
  background: ${ACCENT};
  border-radius: ${THEME_LIGHT.border.radius.sm} ${THEME_LIGHT.border.radius.sm}
    0 0;
  height: ${({ $heightPct }) => `${$heightPct}%`};
  margin: 0 auto;
  max-width: 28px;
  transform-origin: bottom;
  width: 100%;

  @keyframes barGrow {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

function DashboardBarChart({ data }: { data: DashboardBarChartData }) {
  const max = Math.max(...data.bars.map((bar) => bar.value)) || 1;
  return (
    <ChartFrame>
      <PlotArea>
        <Gridlines $bottom={22} aria-hidden>
          {GRID_LINES.map((line) => (
            <GridLine key={line} />
          ))}
        </Gridlines>
        <BarColumns>
          {data.bars.map((bar, index) => (
            <BarColumn key={bar.label}>
              <BarTrack>
                <Bar $heightPct={(bar.value / max) * 100} $index={index} />
              </BarTrack>
              <AxisLabel>{bar.label}</AxisLabel>
            </BarColumn>
          ))}
        </BarColumns>
      </PlotArea>
    </ChartFrame>
  );
}

const DONUT_RADIUS = 15.915;
const DONUT_GAP = 2;

const DonutWrap = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 12px;
  min-height: 0;
`;

const DonutFigure = styled.div`
  flex-shrink: 0;
  height: 96px;
  position: relative;
  width: 96px;
`;

const DonutSvg = styled.svg`
  display: block;
  height: 100%;
  transform: rotate(-90deg);
  width: 100%;

  .donut-slice {
    animation: donutSliceDraw 520ms ${EASING.standard} both;
  }

  @keyframes donutSliceDraw {
    from {
      stroke-dasharray: 0 100;
    }
    to {
      stroke-dasharray: var(--slice-pct) var(--slice-rest);
    }
  }

  ${REDUCED_MOTION} {
    .donut-slice {
      animation: none;
    }
  }
`;

const DonutCenter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

const DonutValue = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 22px;
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  line-height: 1;
`;

const DonutLabel = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 11px;
  line-height: 1.4;
`;

const DonutLegend = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const LegendRow = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  min-width: 0;
`;

const LegendDot = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: ${THEME_LIGHT.border.radius.xs};
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const LegendLabel = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function DashboardDonutChart({ data }: { data: DashboardDonutChartData }) {
  const total = data.slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let cumulative = 0;
  return (
    <DonutWrap>
      <DonutFigure>
        <DonutSvg aria-hidden viewBox="0 0 36 36">
          {data.slices.map((slice, index) => {
            const pct = (slice.value / total) * 100;
            const drawn = Math.max(pct - DONUT_GAP, 0.5);
            const offset = -cumulative;
            cumulative += pct;
            return (
              <circle
                className="donut-slice"
                cx="18"
                cy="18"
                fill="none"
                key={slice.label}
                pathLength={100}
                r={DONUT_RADIUS}
                stroke={slice.color}
                strokeDasharray={`${drawn} ${100 - drawn}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth="3.4"
                style={
                  {
                    '--slice-pct': drawn,
                    '--slice-rest': 100 - drawn,
                    animationDelay: `${index * 120}ms`,
                  } as CSSProperties
                }
              />
            );
          })}
        </DonutSvg>
        <DonutCenter>
          <DonutValue>{data.centerValue}</DonutValue>
          <DonutLabel>{data.centerLabel}</DonutLabel>
        </DonutCenter>
      </DonutFigure>
      <DonutLegend>
        {data.slices.map((slice) => (
          <LegendRow key={slice.label}>
            <LegendDot $color={slice.color} />
            <LegendLabel>{slice.label}</LegendLabel>
          </LegendRow>
        ))}
      </DonutLegend>
    </DonutWrap>
  );
}

export const DASHBOARD_CHARTS = {
  Line: DashboardLineChart,
  Bar: DashboardBarChart,
  Donut: DashboardDonutChart,
};
