import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';

import type { KanbanLane } from '../../types';
import {
  SkeletonBar,
  SkeletonCircle,
} from '../../Shared/components/PreviewSkeleton';
import { KanbanCard } from './KanbanCard';
import {
  KANBAN_LANE_TONES,
  KANBAN_PAGE_COLORS,
  KANBAN_PAGE_FONT,
  KANBAN_PAGE_TABLER_STROKE,
} from './kanban-page-theme';

const Lane = styled.div<{ $index: number; $last?: boolean }>`
  animation: kanbanLaneAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${120 + $index * 80}ms`};
  border-right: ${({ $last }) =>
    $last ? 'none' : `1px solid ${KANBAN_PAGE_COLORS.borderLight}`};
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

const SkeletonCardShell = styled.div<{ $index: number }>`
  animation: kanbanSkeletonCardAppear 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${$index * 90}ms`};
  background: ${KANBAN_PAGE_COLORS.backgroundSecondary};
  border: 1px solid ${KANBAN_PAGE_COLORS.border};
  border-radius: 4px;
  box-shadow: ${KANBAN_PAGE_COLORS.shadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 8px;

  @keyframes kanbanSkeletonCardAppear {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const SkeletonCardField = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  width: 100%;
`;

const SKELETON_FIELD_WIDTHS = ['70%', '54%', '62%'];

function SkeletonCard({ index }: { index: number }) {
  return (
    <SkeletonCardShell $index={index}>
      <SkeletonBar $height={9} $width="64%" />
      {SKELETON_FIELD_WIDTHS.map((width, fieldIndex) => (
        <SkeletonCardField key={fieldIndex}>
          <SkeletonCircle $size={16} />
          <SkeletonBar $height={8} $width={width} />
        </SkeletonCardField>
      ))}
    </SkeletonCardShell>
  );
}

export function KanbanLane({
  lane,
  index = 0,
  isLast,
  generating = false,
}: {
  generating?: boolean;
  index?: number;
  isLast: boolean;
  lane: KanbanLane;
}) {
  const tone = KANBAN_LANE_TONES[lane.tone] ?? KANBAN_LANE_TONES.gray;
  const skeletonCardCount = 2 + (index % 2);

  return (
    <Lane $index={index} $last={isLast}>
      <LaneHeader>
        <LaneTag $background={tone.background} $color={tone.color}>
          {lane.label}
        </LaneTag>
        {generating ? null : <LaneCount>{lane.cards.length}</LaneCount>}
      </LaneHeader>

      <LaneBody>
        {generating
          ? Array.from({ length: skeletonCardCount }, (_, cardIndex) => (
              <SkeletonCard key={cardIndex} index={cardIndex} />
            ))
          : lane.cards.map((card) => <KanbanCard key={card.id} card={card} />)}

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
