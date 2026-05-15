import { useCallback, useEffect, useState } from 'react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import { useAppPreviewState } from '@/sections/AppPreview/Shell/use-app-preview-state';

import {
  NEW_COMPANY_ROW,
  NEW_PERSON_ROW,
  PROMPT_OPTIONS,
} from './product-visual.data';

type AutoplayOptions = {
  externalScene?: number;
};

export function useProductVisualAutoplay(
  visual: AppPreviewConfig,
  options: AutoplayOptions = {},
) {
  const { externalScene } = options;
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [streamedText, setStreamedText] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);
  const [companyAdded, setCompanyAdded] = useState(false);
  const [personAdded, setPersonAdded] = useState(false);

  useEffect(() => {
    if (externalScene !== undefined) {
      setSelectedOption(externalScene);
    }
  }, [externalScene]);

  const {
    activeItem,
    activeLabel,
    activePage,
    handleSelectLabel,
    handleToggleFolder,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    workspaceNav,
  } = useAppPreviewState(visual);

  let displayPage = activePage;
  if (
    activePage !== null &&
    activePage !== undefined &&
    activePage.type === 'table'
  ) {
    const title = activePage.header?.title;
    if (companyAdded && title === 'All Companies') {
      displayPage = {
        ...activePage,
        header: {
          ...activePage.header,
          count: (activePage.header.count ?? 0) + 1,
        },
        rows: [NEW_COMPANY_ROW, ...activePage.rows],
      };
    } else if (personAdded && title === 'All People') {
      displayPage = {
        ...activePage,
        header: {
          ...activePage.header,
          count: (activePage.header.count ?? 0) + 1,
        },
        rows: [NEW_PERSON_ROW, ...activePage.rows],
      };
    }
  }

  const isScrollDriven = externalScene !== undefined;

  useEffect(() => {
    const option = PROMPT_OPTIONS[selectedOption];
    const fullText = option.response;

    if (isScrollDriven) {
      const firstStep = option.navSteps[0];
      if (firstStep) {
        handleSelectLabel(firstStep.target);
      }
      if (selectedOption === 0) {
        setCompanyAdded(true);
      }
    }

    let index = 0;
    const completedSteps = new Set<number>();
    let companyInjected = false;
    let personInjected = false;
    setStreamedText('');
    setStreamComplete(false);
    if (!isScrollDriven) {
      setCompanyAdded(false);
      setPersonAdded(false);
    }
    const interval = setInterval(() => {
      index += 1;
      setStreamedText(fullText.slice(0, index));
      const progress = index / fullText.length;
      option.navSteps.forEach((step, stepIndex) => {
        if (!completedSteps.has(stepIndex) && progress >= step.at) {
          completedSteps.add(stepIndex);
          handleSelectLabel(step.target);
        }
      });
      if (selectedOption === 0) {
        if (!companyInjected && progress >= 0.2) {
          companyInjected = true;
          setCompanyAdded(true);
        }
        if (!personInjected && progress >= 0.6) {
          personInjected = true;
          setPersonAdded(true);
        }
      }
      if (index >= fullText.length) {
        clearInterval(interval);
        setStreamComplete(true);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [selectedOption, handleSelectLabel, isScrollDriven]);

  const handleOptionSelect = useCallback(
    (optionIndex: number) => setSelectedOption(optionIndex),
    [],
  );

  return {
    activeItem,
    activeLabel,
    displayPage,
    handleOptionSelect,
    handleSelectLabel,
    handleToggleFolder,
    highlightedItemId,
    isScrollDriven,
    openFolderIds,
    revealedObjectIds,
    selectedOption,
    streamComplete,
    streamedText,
    workspaceNav,
  };
}
