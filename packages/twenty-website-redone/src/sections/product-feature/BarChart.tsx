'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { EASING } from '@/tokens';

import {
  type DashboardMonth,
  type DashboardStage,
} from './dashboard-visual-data';

const Y_TICK_COUNT = 5;
const X_LABEL_ROW_HEIGHT = 18;

const Root = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const Plot = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: ${X_LABEL_ROW_HEIGHT}px;
  padding-right: 8px;
`;

const YLabel = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: right;
`;

const Bars = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const BarsRow = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 6px;
  min-height: 0;
`;

const BarColumn = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
`;

// New at the bottom, Won at the top (column-reverse keeps the data order while
// stacking upward). Grows from the baseline when the tile becomes active.
const Stack = styled.div`
  border-radius: 3px 3px 0 0;
  display: flex;
  flex-direction: column-reverse;
  min-height: 2px;
  overflow: hidden;
  transform-origin: bottom;
  transition:
    transform 0.8s ${EASING.standard},
    filter 0.15s ease;
  width: 68%;

  &:hover {
    filter: brightness(1.08);
  }
`;

const Segment = styled.div`
  flex-shrink: 0;
  width: 100%;

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

const XLabels = styled.div`
  display: flex;
  gap: 6px;
  height: ${X_LABEL_ROW_HEIGHT}px;
`;

const XLabel = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  flex: 1;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
  padding-top: 6px;
  text-align: center;
`;

// Deals by stage, stacked per month, in the same colours as the donut (blue =
// New … orange = Won). Bars are scaled to the top tick so they read against the
// axis; stacks grow in staggered (50ms per column) when the tile is active.
export function BarChart({
  active,
  months,
  stages,
}: {
  active: boolean;
  months: DashboardMonth[];
  stages: DashboardStage[];
}) {
  const monthlyTotals = months.map((month) =>
    month.values.reduce((sum, value) => sum + value, 0),
  );
  const tickStep = Math.ceil(
    (Math.max(...monthlyTotals) * 1.05) / Y_TICK_COUNT,
  );
  const topTick = tickStep * Y_TICK_COUNT;
  const yTicks = Array.from(
    { length: Y_TICK_COUNT + 1 },
    (_, tickNumber) => tickNumber * tickStep,
  );

  return (
    <Root>
      <Plot>
        <YAxis>
          {yTicks.toReversed().map((tick) => (
            <YLabel key={tick}>{tick}</YLabel>
          ))}
        </YAxis>
        <Bars>
          <BarsRow>
            {months.map((month, columnNumber) => {
              const total = monthlyTotals[columnNumber];
              return (
                <BarColumn key={month.label}>
                  <Stack
                    style={{
                      height: `${(total / topTick) * 100}%`,
                      transform: active ? 'scaleY(1)' : 'scaleY(0)',
                      transitionDelay: active
                        ? `${columnNumber * 50}ms`
                        : '0ms',
                    }}
                  >
                    {stages.map((stage, stageNumber) => (
                      <Segment
                        key={stage.label}
                        data-tone={stage.tone}
                        style={{
                          height: `${(month.values[stageNumber] / total) * 100}%`,
                        }}
                      />
                    ))}
                  </Stack>
                </BarColumn>
              );
            })}
          </BarsRow>
          <XLabels>
            {months.map((month) => (
              <XLabel key={month.label}>{month.label}</XLabel>
            ))}
          </XLabels>
        </Bars>
      </Plot>
    </Root>
  );
}
