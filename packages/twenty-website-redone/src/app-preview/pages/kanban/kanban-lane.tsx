import { styled } from '@linaria/react';
import { IconPlus } from '@tabler/icons-react';

import { EASING } from '@/tokens';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { KanbanCard } from './kanban-card';
import { MiniIcon } from '../../primitives/mini-icon';
import { PREVIEW_SKELETON } from '../../primitives/preview-skeleton';
import { type KanbanLane as KanbanLaneData } from '../../types';

const Lane = styled.div<{ $index: number; $last?: boolean }>`
  animation: kanbanLaneAppear 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 80}ms`};
  border-right: ${({ $last }) =>
    $last ? 'none' : `1px solid ${THEME_LIGHT.border.color.light}`};
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

// A kanban column groups a Select field, so the product renders each column's
// stage as a Tag — color3 surface, color11 text, regular weight — keyed by the
// option color. The values bake from the generated theme (gray is the base and
// the unknown-tone fallback the old hand-mixed table carried).
const LaneTag = styled.span`
  align-items: center;
  background: ${THEME_LIGHT.tag.background.gray};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.tag.text.gray};
  display: inline-flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
  white-space: nowrap;

  &[data-tone='blue'] {
    background: ${THEME_LIGHT.tag.background.blue};
    color: ${THEME_LIGHT.tag.text.blue};
  }
  &[data-tone='green'] {
    background: ${THEME_LIGHT.tag.background.green};
    color: ${THEME_LIGHT.tag.text.green};
  }
  &[data-tone='pink'] {
    background: ${THEME_LIGHT.tag.background.pink};
    color: ${THEME_LIGHT.tag.text.pink};
  }
  &[data-tone='purple'] {
    background: ${THEME_LIGHT.tag.background.purple};
    color: ${THEME_LIGHT.tag.text.purple};
  }
`;

const LaneCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
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
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  padding: 0 4px;
  white-space: nowrap;
`;

const SkeletonCardShell = styled.div<{ $index: number }>`
  animation: kanbanSkeletonCardAppear 320ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${$index * 90}ms`};
  background: ${THEME_LIGHT.background.secondary};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
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
  const skeletonCardCount = 2 + (index % 2);
  return (
    <Lane $index={index} $last={isLast}>
      <LaneHeader>
        <LaneTag data-tone={lane.tone}>{lane.label}</LaneTag>
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
            color={THEME_LIGHT.font.color.light}
            size={12}
          />
          New
        </AddCardButton>
      </LaneBody>
    </Lane>
  );
}
