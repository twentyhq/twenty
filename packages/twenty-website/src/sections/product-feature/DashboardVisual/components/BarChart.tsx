'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { EASING } from '@/tokens';

import { type DashboardMonth } from '../types/dashboard-month';

const X_LABEL_ROW_HEIGHT = 18;
const TARGET_TICK_COUNT = 4;
const BAR_MAX_WIDTH = 26;

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

const PlotArea = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`;

const GridLine = styled.div`
  border-top: 1px dashed ${THEME_LIGHT.border.color.light};
  left: 0;
  position: absolute;
  right: 0;
`;

const BarsRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: 6px;
  inset: 0;
  position: absolute;
`;

const BarColumn = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: center;
  position: relative;
`;

const Bar = styled.div`
  background-color: ${THEME_LIGHT.color.blue8};
  border-radius: ${THEME_LIGHT.border.radius.sm} ${THEME_LIGHT.border.radius.sm}
    0 0;
  max-width: ${BAR_MAX_WIDTH}px;
  transform-origin: bottom;
  transition:
    transform 0.8s ${EASING.standard},
    filter 0.15s ease;
  width: 58%;

  &:hover {
    filter: brightness(1.08);
  }
`;

const ValueLabel = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
  font-variant-numeric: tabular-nums;
  left: 0;
  position: absolute;
  right: 0;
  text-align: center;
  transform: translateY(-3px);
  transition: opacity 0.4s ${EASING.standard};
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

function getNiceScale(maxValue: number): { maxTick: number; ticks: number[] } {
  if (!(maxValue > 0)) {
    return { maxTick: 1, ticks: [0, 1] };
  }
  const rawStep = maxValue / TARGET_TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const tickCount = Math.ceil(maxValue / step);
  return {
    maxTick: step * tickCount,
    ticks: Array.from({ length: tickCount + 1 }, (_, index) => index * step),
  };
}

export function BarChart({
  active,
  months,
}: {
  active: boolean;
  months: DashboardMonth[];
}) {
  const { i18n } = useLingui();
  const maxValue = Math.max(...months.map((month) => month.value));
  const { maxTick, ticks } = getNiceScale(maxValue);

  return (
    <Root>
      <Plot>
        <YAxis>
          {ticks.toReversed().map((tick) => (
            <YLabel key={tick}>{tick}</YLabel>
          ))}
        </YAxis>
        <Bars>
          <PlotArea>
            {ticks.map((tick) => (
              <GridLine
                key={tick}
                style={{ bottom: `${(tick / maxTick) * 100}%` }}
              />
            ))}
            <BarsRow>
              {months.map((month, columnNumber) => {
                const heightPercent = (month.value / maxTick) * 100;
                return (
                  <BarColumn key={month.id}>
                    <ValueLabel
                      style={{
                        bottom: `${heightPercent}%`,
                        opacity: active ? 1 : 0,
                        transitionDelay: active
                          ? `${300 + columnNumber * 50}ms`
                          : '0ms',
                      }}
                    >
                      {month.value}
                    </ValueLabel>
                    <Bar
                      style={{
                        height: `${heightPercent}%`,
                        transform: active ? 'scaleY(1)' : 'scaleY(0)',
                        transitionDelay: active
                          ? `${columnNumber * 50}ms`
                          : '0ms',
                      }}
                    />
                  </BarColumn>
                );
              })}
            </BarsRow>
          </PlotArea>
          <XLabels>
            {months.map((month) => (
              <XLabel key={month.id}>{i18n._(month.label)}</XLabel>
            ))}
          </XLabels>
        </Bars>
      </Plot>
    </Root>
  );
}
