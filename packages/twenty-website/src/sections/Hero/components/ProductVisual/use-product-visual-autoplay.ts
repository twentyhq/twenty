'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import { useAppPreviewExperience } from '@/sections/AppPreview/Shell/use-app-preview-experience';
import type {
  KanbanPageDefinition,
  PageDefinition,
  WorkflowPageDefinition,
} from '@/sections/AppPreview/types/app-preview-data';

import {
  COMPANIES_PAGE_ITEM_ID,
  NEW_COMPANY_ROW,
  NEW_PERSON_ROW,
  NEW_TASK_ROWS,
  PEOPLE_PAGE_ITEM_ID,
  PRODUCT_VISUAL_SCENES,
  QONTO_RECORD_PAGE,
  QONTO_RECORD_PAGE_INITIAL,
  TASKS_PAGE_ITEM_ID,
  type ProductVisualSceneDefinition,
} from './product-visual.data';

type AutoplayOptions = {
  externalScene?: number;
  playbackEnabled?: boolean;
};

type ProductVisualScenePhase =
  | 'base'
  | 'company-added'
  | 'person-added'
  | 'focused'
  | 'tasks-added'
  | 'record-initial'
  | 'record-note-focus'
  | 'record-evidence'
  | 'record-summary'
  | 'workflow-trigger'
  | 'workflow-iterator'
  | 'workflow-send-email'
  | 'workflow-return'
  | 'workflow-final';

function getStreamProgress(streamedLength: number, fullTextLength: number) {
  if (fullTextLength === 0) {
    return 1;
  }

  return Math.min(streamedLength / fullTextLength, 1);
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getVisibleTextLength(text: string) {
  let length = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '*' && text[index + 1] === '*') {
      index += 1;
      continue;
    }

    length += 1;
  }

  return length;
}

function getScenePhase(
  scene: ProductVisualSceneDefinition,
  streamProgress: number,
): ProductVisualScenePhase {
  switch (scene.kind) {
    case 'leadCreation':
      if (streamProgress >= 0.6) {
        return 'person-added';
      }

      if (streamProgress >= 0.2) {
        return 'company-added';
      }

      return 'base';
    case 'opportunityReview':
      return streamProgress >= 0.18 ? 'focused' : 'base';
    case 'taskCreation':
      return streamProgress >= 0.18 ? 'tasks-added' : 'base';
    case 'recordSummary':
      if (streamProgress >= 0.62) {
        return 'record-summary';
      }

      if (streamProgress >= 0.4) {
        return 'record-evidence';
      }

      if (streamProgress >= 0.2) {
        return 'record-note-focus';
      }

      return 'record-initial';
    case 'workflowCreation':
      if (streamProgress >= 0.88) {
        return 'workflow-final';
      }

      if (streamProgress >= 0.7) {
        return 'workflow-return';
      }

      if (streamProgress >= 0.5) {
        return 'workflow-send-email';
      }

      if (streamProgress >= 0.28) {
        return 'workflow-iterator';
      }

      return 'workflow-trigger';
  }
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
    revealProgress <= 0 ? 0 : Math.min(totalCardCount, Math.ceil(revealProgress * totalCardCount));
  let remainingVisibleCards = visibleCardCount;

  const lanes = filteredLanes.map((lane) => {
    const laneVisibleCount = Math.max(
      0,
      Math.min(lane.cards.length, remainingVisibleCards),
    );

    remainingVisibleCards -= laneVisibleCount;

    return {
      ...lane,
      cards: lane.cards.slice(0, laneVisibleCount).map((card) => ({
        ...card,
        checked: true,
      })),
    };
  });

  return {
    ...page,
    header: {
      ...page.header,
      count: visibleCardCount,
      title: 'Closing this month',
    },
    lanes,
  };
}

function buildWorkflowPageForPhase(
  page: WorkflowPageDefinition,
  phase: ProductVisualScenePhase,
): WorkflowPageDefinition {
  if (!page.nodes || phase === 'workflow-final') {
    return page;
  }

  const [triggerNode, iteratorNode, sendEmailNode] = page.nodes;
  const [loopLabel, completedLabel] = page.branchLabels ?? [];

  if (!triggerNode) {
    return page;
  }

  if (phase === 'workflow-trigger') {
    return {
      ...page,
      branchLabels: [],
      edges: [],
      nodes: [triggerNode],
      plusNode: undefined,
    };
  }

  if (!iteratorNode) {
    return page;
  }

  if (phase === 'workflow-iterator') {
    return {
      ...page,
      branchLabels: [],
      edges: [{ from: 'trigger', to: 'iterator', type: 'vertical' }],
      nodes: [triggerNode, iteratorNode].filter(Boolean),
      plusNode: undefined,
    };
  }

  if (!sendEmailNode) {
    return page;
  }

  if (phase === 'workflow-send-email') {
    return {
      ...page,
      branchLabels: loopLabel ? [loopLabel] : [],
      edges: [
        { from: 'trigger', to: 'iterator', type: 'vertical' },
        { from: 'iterator', to: 'send-email', type: 'loopRight' },
      ],
      nodes: [triggerNode, iteratorNode, sendEmailNode],
      plusNode: undefined,
    };
  }

  if (phase === 'workflow-return') {
    return {
      ...page,
      branchLabels: loopLabel ? [loopLabel] : [],
      edges: [
        { from: 'trigger', to: 'iterator', type: 'vertical' },
        { from: 'iterator', to: 'send-email', type: 'loopRight' },
        { from: 'send-email', to: 'trigger', type: 'loopBack' },
      ],
      nodes: [triggerNode, iteratorNode, sendEmailNode],
      plusNode: undefined,
    };
  }

  return {
    ...page,
    branchLabels: [loopLabel, completedLabel].filter(Boolean),
    edges: page.edges ?? [],
    nodes: [triggerNode, iteratorNode, sendEmailNode],
    plusNode: page.plusNode,
  };
}

function buildRecordSummaryPage(
  phase: ProductVisualScenePhase,
): PageDefinition {
  const basePage =
    phase === 'record-initial' ? QONTO_RECORD_PAGE_INITIAL : QONTO_RECORD_PAGE;

  if (phase === 'record-initial') {
    return basePage;
  }

  if (phase === 'record-note-focus') {
    return {
      ...basePage,
      notes: QONTO_RECORD_PAGE.notes.slice(0, 2).map((note, index) => ({
        ...note,
        highlighted: index === 0,
      })),
    };
  }

  if (phase === 'record-evidence') {
    return {
      ...QONTO_RECORD_PAGE,
      record: {
        ...QONTO_RECORD_PAGE.record,
        relations: QONTO_RECORD_PAGE.record.relations.map((section) => ({
          ...section,
          items: section.items.map((item) => ({
            ...item,
            highlighted:
              item.name === 'Q Global Holdings' ||
              item.name === 'Qonto' ||
              item.name === 'Alexandre',
          })),
        })),
      },
      notes: QONTO_RECORD_PAGE.notes.map((note, index) => ({
        ...note,
        highlighted: index < 2,
      })),
    };
  }

  return {
    ...QONTO_RECORD_PAGE,
    record: {
      ...QONTO_RECORD_PAGE.record,
      relations: QONTO_RECORD_PAGE.record.relations.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          highlighted:
            item.name === 'Q Global Holdings' ||
            item.name === 'Qonto' ||
            item.name === 'Alexandre',
        })),
      })),
    },
    notes: QONTO_RECORD_PAGE.notes.map((note, index) => ({
      ...note,
      highlighted: index < 2,
    })),
  };
}

function getVisibleTaskRowCount(streamProgress: number) {
  const revealProgress = clamp((streamProgress - 0.18) / 0.67);

  if (revealProgress <= 0) {
    return 0;
  }

  return Math.min(
    NEW_TASK_ROWS.length,
    Math.ceil(revealProgress * NEW_TASK_ROWS.length),
  );
}

function resolveDisplayPage(
  activePage: PageDefinition,
  activeItemId: string,
  phase: ProductVisualScenePhase,
  scene: ProductVisualSceneDefinition,
  streamProgress: number,
): PageDefinition {
  if (scene.kind === 'recordSummary') {
    return buildRecordSummaryPage(phase);
  }

  if (scene.kind === 'leadCreation' && activePage.type === 'table') {
    if (phase !== 'base' && activeItemId === COMPANIES_PAGE_ITEM_ID) {
      return {
        ...activePage,
        header: {
          ...activePage.header,
          count: (activePage.header.count ?? 0) + 1,
        },
        rows: [NEW_COMPANY_ROW, ...activePage.rows],
      };
    }

    if (phase === 'person-added' && activeItemId === PEOPLE_PAGE_ITEM_ID) {
      return {
        ...activePage,
        header: {
          ...activePage.header,
          count: (activePage.header.count ?? 0) + 1,
        },
        rows: [NEW_PERSON_ROW, ...activePage.rows],
      };
    }

    return activePage;
  }

  if (scene.kind === 'opportunityReview' && activePage.type === 'kanban') {
    return buildFocusedOpportunitiesPage(activePage, streamProgress);
  }

  if (
    scene.kind === 'taskCreation' &&
    activeItemId === TASKS_PAGE_ITEM_ID &&
    activePage.type === 'table'
  ) {
    const visibleTaskRowCount =
      phase === 'base' ? 0 : getVisibleTaskRowCount(streamProgress);

    if (visibleTaskRowCount === 0) {
      return activePage;
    }

    return {
      ...activePage,
      header: {
        ...activePage.header,
        count: (activePage.header.count ?? 0) + visibleTaskRowCount,
      },
      rows: [
        ...activePage.rows,
        ...NEW_TASK_ROWS.slice(0, visibleTaskRowCount),
      ],
    };
  }

  if (scene.kind === 'workflowCreation' && activePage.type === 'workflow') {
    return buildWorkflowPageForPhase(activePage, phase);
  }

  return activePage;
}

export function useProductVisualAutoplay(
  visual: AppPreviewConfig,
  options: AutoplayOptions = {},
) {
  const { externalScene, playbackEnabled = true } = options;
  const [streamedLength, setStreamedLength] = useState(0);
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
  const fullTextVisibleLength = useMemo(
    () => getVisibleTextLength(fullText),
    [fullText],
  );
  const streamProgress = getStreamProgress(streamedLength, fullTextVisibleLength);
  const streamComplete = streamedLength >= fullTextVisibleLength;
  const scenePhase = useMemo(
    () => getScenePhase(selectedScene, streamProgress),
    [selectedScene, streamProgress],
  );
  const displayPage = resolveDisplayPage(
    activePage,
    activeItemId,
    scenePhase,
    selectedScene,
    streamProgress,
  );

  useEffect(() => {
    setStreamedLength(0);
    selectPageItem(selectedScene.initialPageItemId);

    if (!playbackEnabled) {
      return undefined;
    }

    if (fullTextVisibleLength === 0) {
      return undefined;
    }

    let index = 0;
    let followUpPageSelected = false;

    const interval = setInterval(() => {
      index = Math.min(index + 1, fullTextVisibleLength);
      setStreamedLength(index);

      if (
        playbackEnabled &&
        !followUpPageSelected &&
        selectedScene.followUpPageItemId &&
        getStreamProgress(index, fullTextVisibleLength) >= 0.6
      ) {
        followUpPageSelected = true;
        selectPageItem(selectedScene.followUpPageItemId);
      }

      if (index >= fullTextVisibleLength) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [fullTextVisibleLength, playbackEnabled, selectPageItem, selectedScene]);

  return {
    activeItem,
    activeItemId,
    activeItemLabel,
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
