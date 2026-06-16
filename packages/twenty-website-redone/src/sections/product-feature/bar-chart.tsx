'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { EASING } from '@/tokens';
import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

const palette = PRODUCT_FEATURE_PALETTE;

const Panel = styled.div`
  background-color: ${palette.background};
  border: 1px solid ${palette.border};
  border-radius: 10px;
  box-shadow: ${palette.shadow.light};
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-width: 0;
  padding: 14px 16px;
`;

const PanelTitle = styled.span`
  color: ${palette.textSecondary};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const ChartWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const ChartBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const YAxisTitle = styled.span`
  align-self: center;
  color: ${palette.textTertiary};
  font-size: 9px;
  letter-spacing: 0.03em;
  margin-right: 12px;
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: flex-end;
  padding-bottom: 20px;
  padding-right: 6px;
`;

const YLabel = styled.span`
  color: ${palette.textTertiary};
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: right;
`;

const BarsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const BarsArea = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 4px;
  min-height: 0;
`;

const BarColumn = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
`;

const BarPair = styled.div`
  align-items: flex-end;
  display: flex;
  flex: 1;
  gap: 2px;
  justify-content: center;
  min-height: 0;
  width: 100%;
`;

const BarWithLabel = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  justify-content: flex-end;
  width: 40%;
`;

const Bar = styled.div`
  border-radius: 3px 3px 0 0;
  cursor: pointer;
  min-height: 2px;
  transition:
    height 0.8s ${EASING.standard},
    filter 0.15s ease;
  width: 100%;
`;

const BarValue = styled.span`
  color: ${palette.textSecondary};
  font-size: 8px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1;
`;

const BarLabel = styled.span`
  color: ${palette.textTertiary};
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

const XAxisTitle = styled.div`
  color: ${palette.textTertiary};
  font-size: 9px;
  letter-spacing: 0.03em;
  padding-top: 6px;
  text-align: center;
`;

export type BarDatum = {
  label: string;
  value: number;
  value2: number;
};

const Y_TICK_COUNT = 5;

// Bars grow in staggered (50ms per column, 25ms between the pair) when
// the tile becomes active; hovering a column brightens it.
export function BarChart({
  active,
  data,
}: {
  active: boolean;
  data: BarDatum[];
}) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const allValues = data.flatMap((datum) => [datum.value, datum.value2]);
  const maxValue = Math.max(...allValues) * 1.05;
  const tickStep = Math.ceil(maxValue / Y_TICK_COUNT);
  const yTicks = Array.from(
    { length: Y_TICK_COUNT + 1 },
    (_, tickNumber) => tickNumber * tickStep,
  );
  const columns = data.map((datum, columnNumber) => ({
    columnNumber,
    datum,
  }));

  return (
    <Panel>
      <PanelTitle>Widget name</PanelTitle>
      <ChartWrapper>
        <ChartBody>
          <YAxisTitle>Values</YAxisTitle>
          <YAxis>
            {yTicks.toReversed().map((tick) => (
              <YLabel key={tick}>{tick === 0 ? '0' : `${tick}K`}</YLabel>
            ))}
          </YAxis>
          <BarsContainer>
            <BarsArea>
              {columns.map(({ columnNumber, datum }) => {
                const firstHeight = (datum.value / maxValue) * 100;
                const secondHeight = (datum.value2 / maxValue) * 100;
                const isHovered = hoveredNumber === columnNumber;

                return (
                  <BarColumn
                    key={columnNumber}
                    onPointerEnter={() => setHoveredNumber(columnNumber)}
                    onPointerLeave={() => setHoveredNumber(null)}
                  >
                    <BarPair>
                      <BarWithLabel>
                        {active ? (
                          <BarValue style={{ opacity: isHovered ? 1 : 0.7 }}>
                            {datum.value}
                          </BarValue>
                        ) : null}
                        <Bar
                          style={{
                            backgroundColor: palette.chart.primary,
                            filter: isHovered ? 'brightness(1.2)' : 'none',
                            height: active ? `${firstHeight}%` : '0%',
                            transitionDelay: active
                              ? `${columnNumber * 50}ms`
                              : '0ms',
                          }}
                        />
                      </BarWithLabel>
                      <BarWithLabel>
                        {active ? (
                          <BarValue style={{ opacity: isHovered ? 1 : 0.7 }}>
                            {datum.value2}
                          </BarValue>
                        ) : null}
                        <Bar
                          style={{
                            backgroundColor: palette.chart.secondary,
                            filter: isHovered ? 'brightness(1.2)' : 'none',
                            height: active ? `${secondHeight}%` : '0%',
                            transitionDelay: active
                              ? `${columnNumber * 50 + 25}ms`
                              : '0ms',
                          }}
                        />
                      </BarWithLabel>
                    </BarPair>
                    <BarLabel>{datum.label}</BarLabel>
                  </BarColumn>
                );
              })}
            </BarsArea>
            <XAxisTitle>Months</XAxisTitle>
          </BarsContainer>
        </ChartBody>
      </ChartWrapper>
    </Panel>
  );
}
