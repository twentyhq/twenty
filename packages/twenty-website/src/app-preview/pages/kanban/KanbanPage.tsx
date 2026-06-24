import { styled } from '@linaria/react';

import { KanbanLane } from './KanbanLane';
import { type KanbanPageDefinition } from '../../types';

// The product's RECORD_BOARD_COLUMN_WIDTH.
const KANBAN_LANE_WIDTH_PX = 200;

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
    minmax(${KANBAN_LANE_WIDTH_PX}px, 1fr)
  );
  min-height: 100%;
  min-width: ${({ $laneCount }) =>
    `max(100%, ${$laneCount * KANBAN_LANE_WIDTH_PX + 16}px)`};
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
            generating={page.generating}
            index={index}
            isLast={index === page.lanes.length - 1}
            key={lane.id}
            lane={lane}
          />
        ))}
      </BoardCanvas>
    </BoardShell>
  );
}
