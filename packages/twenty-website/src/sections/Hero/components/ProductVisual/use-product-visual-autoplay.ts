import { useEffect, useMemo, useState } from 'react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import { useAppPreviewExperience } from '@/sections/AppPreview/Shell/use-app-preview-experience';
import type { PageDefinition } from '@/sections/AppPreview/types/app-preview-data';

import {
  COMPANIES_PAGE_ITEM_ID,
  NEW_COMPANY_ROW,
  NEW_PERSON_ROW,
  NEW_TASK_ROWS,
  PEOPLE_PAGE_ITEM_ID,
  PROMPT_OPTIONS,
  QONTO_RECORD_PAGE,
  TASKS_PAGE_ITEM_ID,
} from './product-visual.data';

type AutoplayOptions = {
  externalScene?: number;
};

type ProductVisualSceneFlags = {
  companyAdded: boolean;
  personAdded: boolean;
  recordReady: boolean;
  tasksAdded: boolean;
};

function getStreamProgress(streamedLength: number, fullTextLength: number) {
  if (fullTextLength === 0) {
    return 1;
  }

  return Math.min(streamedLength / fullTextLength, 1);
}

function getSceneFlags(
  selectedOption: number,
  isScrollDriven: boolean,
  streamProgress: number,
): ProductVisualSceneFlags {
  return {
    companyAdded:
      selectedOption === 0 && (isScrollDriven || streamProgress >= 0.2),
    personAdded: selectedOption === 0 && streamProgress >= 0.6,
    recordReady:
      selectedOption === 3 && (isScrollDriven || streamProgress >= 0.5),
    tasksAdded:
      selectedOption === 2 && (isScrollDriven || streamProgress >= 0.3),
  };
}

function resolveDisplayPage(
  activePage: PageDefinition,
  activeItemId: string,
  sceneFlags: ProductVisualSceneFlags,
): PageDefinition {
  if (sceneFlags.recordReady) {
    return QONTO_RECORD_PAGE;
  }

  if (activePage.type !== 'table') {
    return activePage;
  }

  if (sceneFlags.companyAdded && activeItemId === COMPANIES_PAGE_ITEM_ID) {
    return {
      ...activePage,
      header: {
        ...activePage.header,
        count: (activePage.header.count ?? 0) + 1,
      },
      rows: [NEW_COMPANY_ROW, ...activePage.rows],
    };
  }

  if (sceneFlags.personAdded && activeItemId === PEOPLE_PAGE_ITEM_ID) {
    return {
      ...activePage,
      header: {
        ...activePage.header,
        count: (activePage.header.count ?? 0) + 1,
      },
      rows: [NEW_PERSON_ROW, ...activePage.rows],
    };
  }

  if (sceneFlags.tasksAdded && activeItemId === TASKS_PAGE_ITEM_ID) {
    return {
      ...activePage,
      header: {
        ...activePage.header,
        count: (activePage.header.count ?? 0) + NEW_TASK_ROWS.length,
      },
      rows: [...NEW_TASK_ROWS, ...activePage.rows],
    };
  }

  return activePage;
}

export function useProductVisualAutoplay(
  visual: AppPreviewConfig,
  options: AutoplayOptions = {},
) {
  const { externalScene } = options;
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [streamedLength, setStreamedLength] = useState(0);

  useEffect(() => {
    if (externalScene !== undefined) {
      const clamped = Math.max(
        0,
        Math.min(externalScene, PROMPT_OPTIONS.length - 1),
      );
      setSelectedOption(clamped);
    }
  }, [externalScene]);

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
  const isScrollDriven = externalScene !== undefined;
  const selectedOptionData = PROMPT_OPTIONS[selectedOption];
  const fullText = selectedOptionData.responseText;
  const streamProgress = getStreamProgress(streamedLength, fullText.length);
  const streamedText = fullText.slice(0, streamedLength);
  const streamComplete = streamedLength >= fullText.length;
  const sceneFlags = useMemo(
    () => getSceneFlags(selectedOption, isScrollDriven, streamProgress),
    [isScrollDriven, selectedOption, streamProgress],
  );
  const displayPage = resolveDisplayPage(
    activePage,
    activeItemId,
    sceneFlags,
  );

  useEffect(() => {
    setStreamedLength(0);

    if (isScrollDriven) {
      if (selectedOption !== 3) {
        const firstStep = selectedOptionData.navSteps[0];
        if (firstStep) {
          selectPageItem(firstStep.targetPageItemId);
        }
      }
    }

    if (fullText.length === 0) {
      return undefined;
    }

    let index = 0;
    const completedSteps = new Set<number>();

    if (isScrollDriven && selectedOption !== 3 && selectedOptionData.navSteps[0]) {
      completedSteps.add(0);
    }

    const interval = setInterval(() => {
      index = Math.min(index + 1, fullText.length);
      setStreamedLength(index);
      const progress = getStreamProgress(index, fullText.length);

      selectedOptionData.navSteps.forEach((step, stepIndex) => {
        if (!completedSteps.has(stepIndex) && progress >= step.at) {
          completedSteps.add(stepIndex);
          selectPageItem(step.targetPageItemId);
        }
      });

      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [fullText, isScrollDriven, selectPageItem, selectedOption, selectedOptionData]);

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
    selectedOption,
    streamComplete,
    streamedText,
    toggleFolder,
    workspaceEntries,
  };
}
