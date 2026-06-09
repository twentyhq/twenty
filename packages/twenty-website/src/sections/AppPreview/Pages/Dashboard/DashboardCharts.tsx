'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';

import { styled } from '@linaria/react';

import { createAnimationFrameLoop } from '@/lib/animation';

import type {
  DashboardBarChart,
  DashboardDonutChart,
  DashboardLineChart,
} from '../../types';
import { APP_FONT, COLORS } from '../../Shared/utils/app-preview-theme';

const ACCENT = '#8da4ef';

const ChartFrame = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const AxisLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
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
  border-top: 1px dashed ${COLORS.borderLight};
  display: block;
  width: 100%;
`;

const GRID_LINES = [0, 1, 2, 3];

// --- Line chart -------------------------------------------------------------

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

  @media (prefers-reduced-motion: reduce) {
    .line-area,
    .line-stroke {
      transition: none;
    }
  }
`;

export function DashboardLineChart({ data }: { data: DashboardLineChart }) {
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

    return [x, y] as const;
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
        <Gridlines $bottom={0} aria-hidden="true">
          {GRID_LINES.map((line) => (
            <GridLine key={line} />
          ))}
        </Gridlines>
        <LineSvg
          viewBox={`0 0 ${LINE_W} ${LINE_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: drawn ? 1 : 0 }}
            vectorEffect="non-scaling-stroke"
          />
        </LineSvg>
      </PlotArea>
    </ChartFrame>
  );
}

// --- Bar chart --------------------------------------------------------------

const BarColumns = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 10px;
  min-height: 0;
  padding-top: 8px;
  position: relative;
  width: 100%;
  z-index: 1;
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
  animation: barGrow 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${$index * 90}ms`};
  background: ${ACCENT};
  border-radius: 4px 4px 0 0;
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

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export function DashboardBarChart({ data }: { data: DashboardBarChart }) {
  const max = Math.max(...data.bars.map((bar) => bar.value)) || 1;

  return (
    <ChartFrame>
      <PlotArea>
        <Gridlines $bottom={22} aria-hidden="true">
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

// --- Donut chart ------------------------------------------------------------

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
    animation: donutSliceDraw 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes donutSliceDraw {
    from {
      stroke-dasharray: 0 100;
    }
    to {
      stroke-dasharray: var(--slice-pct) var(--slice-rest);
    }
  }

  @media (prefers-reduced-motion: reduce) {
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
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
`;

const DonutLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
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
  border-radius: 2px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const LegendLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function DashboardDonutChart({ data }: { data: DashboardDonutChart }) {
  const total = data.slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let cumulative = 0;

  return (
    <DonutWrap>
      <DonutFigure>
        <DonutSvg viewBox="0 0 36 36" aria-hidden="true">
          {data.slices.map((slice, index) => {
            const pct = (slice.value / total) * 100;
            const drawn = Math.max(pct - DONUT_GAP, 0.5);
            const offset = -cumulative;
            cumulative += pct;

            return (
              <circle
                key={slice.label}
                className="donut-slice"
                cx="18"
                cy="18"
                r={DONUT_RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth="3.4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${drawn} ${100 - drawn}`}
                strokeDashoffset={offset}
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
