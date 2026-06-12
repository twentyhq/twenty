'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { ACCENT, ACCENT_SECONDARY } from './dashboard-visual.data';
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
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-width: 0;
  padding: 14px 16px;
`;

const PanelTitle = styled.span`
  color: ${TEXT_SECONDARY};
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
  color: ${TEXT_MUTED};
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
  color: ${TEXT_MUTED};
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
    height 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.15s ease;
  width: 100%;
`;

const BarValue = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 8px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  line-height: 1;
`;

const BarLabel = styled.span`
  color: ${TEXT_MUTED};
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

const XAxisTitle = styled.div`
  color: ${TEXT_MUTED};
  font-size: 9px;
  letter-spacing: 0.03em;
  padding-top: 6px;
  text-align: center;
`;

type BarDatum = {
  label: string;
  value: number;
  value2: number;
};

type BarChartProps = {
  active: boolean;
  data: BarDatum[];
};

const Y_TICK_COUNT = 5;

export function BarChart({ active, data }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const allValues = data.flatMap((datum) => [datum.value, datum.value2]);
  const maxValue = Math.max(...allValues) * 1.05;
  const tickStep = Math.ceil(maxValue / Y_TICK_COUNT);
  const yTicks = Array.from(
    { length: Y_TICK_COUNT + 1 },
    (_, i) => i * tickStep,
  );

  return (
    <Panel>
      <PanelTitle>Widget name</PanelTitle>
      <ChartWrapper>
        <ChartBody>
          <YAxisTitle>Values</YAxisTitle>
          <YAxis>
            {[...yTicks].reverse().map((tick) => (
              <YLabel key={tick}>{tick === 0 ? '0' : `${tick}K`}</YLabel>
            ))}
          </YAxis>
          <BarsContainer>
            <BarsArea>
              {data.map((datum, index) => {
                const h1 = (datum.value / maxValue) * 100;
                const h2 = (datum.value2 / maxValue) * 100;
                const isHovered = hoveredIndex === index;

                return (
                  <BarColumn
                    key={index}
                    onPointerEnter={() => setHoveredIndex(index)}
                    onPointerLeave={() => setHoveredIndex(null)}
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
                            backgroundColor: ACCENT,
                            filter: isHovered ? 'brightness(1.2)' : 'none',
                            height: active ? `${h1}%` : '0%',
                            transitionDelay: active ? `${index * 50}ms` : '0ms',
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
                            backgroundColor: ACCENT_SECONDARY,
                            filter: isHovered ? 'brightness(1.2)' : 'none',
                            height: active ? `${h2}%` : '0%',
                            transitionDelay: active
                              ? `${index * 50 + 25}ms`
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
