import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { KanbanCard } from './kanban-card';
import { MiniIcon } from '../../primitives/mini-icon';
import { PREVIEW_COLORS } from '../../preview-colors';
import { type KanbanLane as KanbanLaneData } from '../../types';

const theme = APP_PREVIEW_THEME;

const Lane = styled.div<{ $index: number; $last?: boolean }>`
  animation: kanbanLaneAppear 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 80}ms`};
  border-right: ${({ $last }) =>
    $last ? 'none' : `1px solid ${PREVIEW_COLORS.borderLight}`};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;

  @keyframes kanbanLaneAppear {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.medium};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
  white-space: nowrap;
`;

const LaneCount = styled.span`
  color: ${PREVIEW_COLORS.textTertiary};
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
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
  color: ${PREVIEW_COLORS.textTertiary};
  display: inline-flex;
  font-family: ${theme.font.family};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.regular};
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  padding: 0 4px;
  white-space: nowrap;
`;

export function KanbanLane({
  lane,
  index = 0,
  isLast,
}: {
  index?: number;
  isLast: boolean;
  lane: KanbanLaneData;
}) {
  const tone =
    APP_PREVIEW_TONES.kanbanLane[lane.tone] ??
    APP_PREVIEW_TONES.kanbanLane.gray;
  return (
    <Lane $index={index} $last={isLast}>
      <LaneHeader>
        <LaneTag $background={tone.background} $color={tone.color}>
          {lane.label}
        </LaneTag>
        <LaneCount>{lane.cards.length}</LaneCount>
      </LaneHeader>
      <LaneBody>
        {lane.cards.map((card) => (
          <KanbanCard card={card} key={card.id} />
        ))}
        <AddCardButton aria-hidden>
          <MiniIcon
            icon={IconPlus}
            color={PREVIEW_COLORS.textLight}
            size={12}
          />
          New
        </AddCardButton>
      </LaneBody>
    </Lane>
  );
}
