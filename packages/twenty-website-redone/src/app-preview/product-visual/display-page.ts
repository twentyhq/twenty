import {
  type KanbanPageDefinition,
  type PageDefinition,
} from '../types';
import { NEW_TASK_ROWS } from './new-task-rows';
import { type ProductVisualSceneDefinition } from './product-visual-scenes';

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

// An empty answer counts as fully streamed: scenes without responseText
// (the intro) must never sit in the "generating" state.
function getStreamProgress(streamedLength: number, fullTextLength: number) {
  if (fullTextLength === 0) {
    return 1;
  }

  return Math.min(streamedLength / fullTextLength, 1);
}

// Cards "arrive" while the answer streams: reveal runs over the 18%–80%
// stretch of stream progress, filling lanes left to right.
function buildFocusedOpportunitiesPage(
  page: KanbanPageDefinition,
  streamProgress: number,
): KanbanPageDefinition {
  const filteredLanes = page.lanes.filter((lane) => lane.cards.length > 0);
  const revealProgress = clamp01((streamProgress - 0.18) / 0.62);
  const totalCardCount = filteredLanes.reduce(
    (total, lane) => total + lane.cards.length,
    0,
  );
  const visibleCardCount =
    revealProgress <= 0
      ? 0
      : Math.min(totalCardCount, Math.ceil(revealProgress * totalCardCount));
  let remainingVisibleCards = visibleCardCount;

  const lanes = filteredLanes.map((lane) => {
    const laneVisibleCount = Math.max(
      0,
      Math.min(lane.cards.length, remainingVisibleCards),
    );

    remainingVisibleCards -= laneVisibleCount;

    return {
      cards: lane.cards.slice(0, laneVisibleCount),
      id: lane.id,
      label: lane.label,
      tone: lane.tone,
    };
  });

  return {
    ...page,
    header: {
      ...page.header,
      count: visibleCardCount,
      title: 'Pipeline by stage',
    },
    lanes,
  };
}

// The page each AI scene presents while its answer streams: generating
// skeletons at 0% progress, then the scene's data.
function resolveDisplayPage(
  activePage: PageDefinition,
  activeItemId: string,
  scene: ProductVisualSceneDefinition,
  streamProgress: number,
): PageDefinition {
  if (scene.kind === 'opportunityReview' && activePage.type === 'kanban') {
    const generating = streamProgress === 0;
    const focusedPage = buildFocusedOpportunitiesPage(activePage, 1);

    return {
      ...focusedPage,
      generating,
      header: {
        ...focusedPage.header,
        count: generating ? undefined : focusedPage.header.count,
      },
    };
  }

  if (scene.kind === 'dashboardCreation' && activePage.type === 'dashboard') {
    return {
      ...activePage,
      dashboard: {
        ...activePage.dashboard,
        generating: streamProgress === 0,
      },
    };
  }

  if (
    scene.kind === 'taskCreation' &&
    activeItemId === scene.initialPageItemId &&
    activePage.type === 'table'
  ) {
    const generating = streamProgress === 0;

    return {
      ...activePage,
      generating,
      header: {
        ...activePage.header,
        count: generating ? undefined : NEW_TASK_ROWS.length,
      },
      rows: NEW_TASK_ROWS,
    };
  }

  if (scene.kind === 'workflowCreation' && activePage.type === 'workflow') {
    return {
      ...activePage,
      generating: streamProgress === 0,
    };
  }

  return activePage;
}

export const displayPage = {
  buildFocusedOpportunitiesPage,
  getStreamProgress,
  resolveDisplayPage,
};
