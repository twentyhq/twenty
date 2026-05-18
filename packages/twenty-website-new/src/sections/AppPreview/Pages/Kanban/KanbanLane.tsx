import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';

import type { KanbanLane } from '../../types';
import { KanbanCard } from './KanbanCard';
import {
  KANBAN_LANE_TONES,
  KANBAN_PAGE_COLORS,
  KANBAN_PAGE_FONT,
  KANBAN_PAGE_TABLER_STROKE,
} from './kanban-page-theme';

const Lane = styled.div<{ $last?: boolean }>`
  border-right: ${({ $last }) =>
    $last ? 'none' : `1px solid ${KANBAN_PAGE_COLORS.borderLight}`};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const LaneHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 40px;
  padding: 8px;
`;

const LaneTag = styled.span<{ $background: string; $color: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: 4px;
  color: ${({ $color }) => $color};
  display: inline-flex;
  font-family: ${KANBAN_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
  white-space: nowrap;
`;

const LaneCount = styled.span`
  color: ${KANBAN_PAGE_COLORS.textTertiary};
  font-family: ${KANBAN_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const LaneBody = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 0 8px 8px;
`;

const AddCardButton = styled.div`
  align-items: center;
  color: ${KANBAN_PAGE_COLORS.textTertiary};
  display: inline-flex;
  font-family: ${KANBAN_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  padding: 0 4px;
  white-space: nowrap;
`;

export function KanbanLane({
  lane,
  isLast,
}: {
  isLast: boolean;
  lane: KanbanLane;
}) {
  const tone = KANBAN_LANE_TONES[lane.tone] ?? KANBAN_LANE_TONES.gray;

  return (
    <Lane $last={isLast}>
      <LaneHeader>
        <LaneTag $background={tone.background} $color={tone.color}>
          {lane.label}
        </LaneTag>
        <LaneCount>{lane.cards.length}</LaneCount>
      </LaneHeader>

      <LaneBody>
        {lane.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}

        <AddCardButton aria-hidden="true">
          <IconPlus
            aria-hidden
            color={KANBAN_PAGE_COLORS.textLight}
            size={12}
            stroke={KANBAN_PAGE_TABLER_STROKE}
          />
          New
        </AddCardButton>
      </LaneBody>
    </Lane>
  );
}
