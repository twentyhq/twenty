'use client';

import { useEffect, useState } from 'react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import { useAppPreviewExperience } from '@/sections/AppPreview/Shell/use-app-preview-experience';
import type {
  KanbanPageDefinition,
  PageDefinition,
} from '@/sections/AppPreview/types/app-preview-data';

import {
  NEW_TASK_ROWS,
  PRODUCT_VISUAL_SCENES,
  TASKS_PAGE_ITEM_ID,
  type ProductVisualSceneDefinition,
} from './product-visual.data';
import { getVisibleLength } from './streamed-markdown';

type AutoplayOptions = {
  externalScene?: number;
  playbackEnabled?: boolean;
};

function getStreamProgress(streamedLength: number, fullTextLength: number) {
  if (fullTextLength === 0) {
    return 1;
  }

  return Math.min(streamedLength / fullTextLength, 1);
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function buildFocusedOpportunitiesPage(
  page: KanbanPageDefinition,
  streamProgress: number,
): KanbanPageDefinition {
  const filteredLanes = page.lanes.filter((lane) => lane.cards.length > 0);
  const revealProgress = clamp((streamProgress - 0.18) / 0.62);
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
      ...lane,
      cards: lane.cards.slice(0, laneVisibleCount),
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
    activeItemId === TASKS_PAGE_ITEM_ID &&
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

export function useProductVisualAutoplay(
  visual: AppPreviewConfig,
  options: AutoplayOptions = {},
) {
  const { externalScene, playbackEnabled = true } = options;
  const [streamedLength, setStreamedLength] = useState(0);
  const [completedStepCount, setCompletedStepCount] = useState(0);
  const selectedOption =
    externalScene !== undefined
      ? Math.max(0, Math.min(externalScene, PRODUCT_VISUAL_SCENES.length - 1))
      : 0;

  const {
    activeItem,
    activeItemId,
    activeItemLabel,
    activePage,
    favorites,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    selectPageItem,
    toggleFolder,
    workspaceEntries,
  } = useAppPreviewExperience(visual);

  const selectedScene = PRODUCT_VISUAL_SCENES[selectedOption];
  const fullText = selectedScene.responseText;
  const fullTextVisibleLength = getVisibleLength(fullText);
  const streamComplete = streamedLength >= fullTextVisibleLength;
  const streamProgress = getStreamProgress(
    streamedLength,
    fullTextVisibleLength,
  );
  const displayPage = resolveDisplayPage(
    activePage,
    activeItemId,
    selectedScene,
    streamProgress,
  );

  useEffect(() => {
    setStreamedLength(0);
    setCompletedStepCount(0);
    selectPageItem(selectedScene.initialPageItemId);

    if (!playbackEnabled) {
      return undefined;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let streamInterval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const startStreaming = () => {
      if (cancelled || fullTextVisibleLength === 0) {
        return;
      }

      let index = 0;
      let followUpPageSelected = false;

      streamInterval = setInterval(() => {
        index = Math.min(index + 1, fullTextVisibleLength);
        setStreamedLength(index);

        if (
          !followUpPageSelected &&
          selectedScene.followUpPageItemId &&
          getStreamProgress(index, fullTextVisibleLength) >= 0.6
        ) {
          followUpPageSelected = true;
          selectPageItem(selectedScene.followUpPageItemId);
        }

        if (index >= fullTextVisibleLength && streamInterval) {
          clearInterval(streamInterval);
        }
      }, 20);
    };

    // Agentic preamble: play thinking + tool steps in sequence, then stream the answer.
    const steps = selectedScene.steps ?? [];

    const playStep = (stepIndex: number) => {
      if (cancelled) {
        return;
      }

      if (stepIndex >= steps.length) {
        startStreaming();
        return;
      }

      const timer = setTimeout(() => {
        setCompletedStepCount(stepIndex + 1);
        playStep(stepIndex + 1);
      }, steps[stepIndex].durationMs);

      timers.push(timer);
    };

    playStep(0);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);

      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, [fullTextVisibleLength, playbackEnabled, selectPageItem, selectedScene]);

  const agentSteps = selectedScene.steps ?? [];
  const preambleComplete = completedStepCount >= agentSteps.length;
  const activeStepIndex = preambleComplete ? -1 : completedStepCount;

  return {
    activeItem,
    activeItemId,
    activeItemLabel,
    activeStepIndex,
    agentSteps,
    completedStepCount,
    displayPage,
    favorites,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    selectPageItem,
    selectedScene,
    streamComplete,
    streamedTextVisibleLength: streamedLength,
    toggleFolder,
    workspaceEntries,
  };
}
