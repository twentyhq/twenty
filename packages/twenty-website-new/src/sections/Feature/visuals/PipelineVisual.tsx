'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';
import { STAGES } from './pipeline-visual.data';
import { WindowChrome } from './WindowChrome';

const Board = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
  overflow-x: auto;
`;

const Column = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 120px;

  &:not(:last-child) {
    border-right: 1px solid ${BORDER_COLOR};
  }
`;

const ColumnHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_COLOR};
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px 12px;
`;

const StageIndicator = styled.span`
  border-radius: 50%;
  flex-shrink: 0;
  height: 7px;
  width: 7px;
`;

const StageName = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const StageCount = styled.span`
  color: ${TEXT_MUTED};
  font-size: 10px;
  margin-left: auto;
`;

const Cards = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
`;

const DealCard = styled.div`
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }

  &[data-selected='true'] {
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const DealTop = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`;

const DealAvatar = styled.span`
  align-items: center;
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  height: 20px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 20px;
`;

const DealCompany = styled.span`
  color: ${TEXT_PRIMARY};
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DealAmount = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
`;

type PipelineVisualProps = {
  active: boolean;
};

export function PipelineVisual({ active }: PipelineVisualProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <WindowChrome breadcrumb="Deals" breadcrumbBold="Pipeline" title="Apple">
      <Board>
        {STAGES.map((stage) => (
          <Column key={stage.name}>
            <ColumnHeader>
              <StageIndicator style={{ backgroundColor: stage.color }} />
              <StageName>{stage.name}</StageName>
              <StageCount>{stage.deals.length}</StageCount>
            </ColumnHeader>
            <Cards>
              {stage.deals.map((deal) => {
                const key = `${stage.name}-${deal.company}`;
                return (
                  <DealCard
                    data-selected={selected === key}
                    key={key}
                    onClick={() => setSelected(selected === key ? null : key)}
                  >
                    <DealTop>
                      <DealAvatar
                        style={{
                          backgroundColor: `${stage.color}22`,
                          color: stage.color,
                        }}
                      >
                        {deal.initials}
                      </DealAvatar>
                      <DealCompany>{deal.company}</DealCompany>
                    </DealTop>
                    <DealAmount>{deal.amount}</DealAmount>
                  </DealCard>
                );
              })}
            </Cards>
          </Column>
        ))}
      </Board>
    </WindowChrome>
  );
}
