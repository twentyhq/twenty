import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { KanbanCard } from './kanban-card';
import { MiniIcon } from '../../primitives/mini-icon';
import { PREVIEW_SKELETON } from '../../primitives/preview-skeleton';
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

const SkeletonCardShell = styled.div<{ $index: number }>`
  animation: kanbanSkeletonCardAppear 320ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${$index * 90}ms`};
  background: ${PREVIEW_COLORS.backgroundSecondary};
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: 4px;
  box-shadow: ${theme.boxShadow.light};
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
      <PREVIEW_SKELETON.Bar $height={9} $width="64%" />
      {SKELETON_FIELD_WIDTHS.map((width) => (
        <SkeletonCardField key={width}>
          <PREVIEW_SKELETON.Circle $size={16} />
          <PREVIEW_SKELETON.Bar $height={8} $width={width} />
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
  lane: KanbanLaneData;
}) {
  const tone =
    APP_PREVIEW_TONES.kanbanLane[lane.tone] ??
    APP_PREVIEW_TONES.kanbanLane.gray;
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
              <SkeletonCard index={cardIndex} key={cardIndex} />
            ))
          : lane.cards.map((card) => <KanbanCard card={card} key={card.id} />)}
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
