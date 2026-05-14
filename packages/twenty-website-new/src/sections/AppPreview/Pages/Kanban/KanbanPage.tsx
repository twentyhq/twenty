'use client';

import { styled } from '@linaria/react';
import type { KanbanPageDefinition } from '../../types';
import { KanbanLane } from './KanbanLane';
import { KANBAN_LANE_WIDTH } from './kanban-page-theme';

const BoardShell = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BoardCanvas = styled.div<{ $laneCount: number }>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(
    ${({ $laneCount }) => $laneCount},
    minmax(${KANBAN_LANE_WIDTH}px, 1fr)
  );
  min-height: 100%;
  min-width: ${({ $laneCount }) =>
    `max(100%, ${$laneCount * KANBAN_LANE_WIDTH + 16}px)`};
  padding: 0 8px;
  width: 100%;
`;

export function KanbanPage({ page }: { page: KanbanPageDefinition }) {
  return (
    <BoardShell
      aria-label={`Interactive preview of the ${page.header.title} board`}
    >
      <BoardCanvas $laneCount={page.lanes.length}>
        {page.lanes.map((lane, index) => (
          <KanbanLane
            key={lane.id}
            isLast={index === page.lanes.length - 1}
            lane={lane}
          />
        ))}
      </BoardCanvas>
    </BoardShell>
  );
}
