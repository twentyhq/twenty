'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CRM_SCENARIO } from '../data/rocket-objects';
import { type AppPreviewConfig } from '../types';
import { useAppPreviewCrmScenario } from './use-app-preview-crm-scenario';
import { useAppPreviewNavigation } from './use-app-preview-navigation';

const COMPLETED_ACTIVE_OBJECT_ID = CRM_SCENARIO.sequence.at(-1)!.id;

// Navigation composed with the AI scenario: the sidebar the user navigates
// is the scenario-extended one, and a created object's page jump waits
// until its sidebar item exists (the pending selection).
export function useAppPreviewExperience(visual: AppPreviewConfig) {
  const scenario = useAppPreviewCrmScenario(visual.sidebar.workspace);
  const scenarioConfig = useMemo<AppPreviewConfig>(
    () => ({
      ...visual,
      sidebar: {
        ...visual.sidebar,
        workspace: scenario.workspaceEntries,
      },
    }),
    [scenario.workspaceEntries, visual],
  );
  const navigation = useAppPreviewNavigation(scenarioConfig);
  const {
    handleJumpToConversationEnd: completeScenario,
    handleObjectCreated: revealObject,
    handleScenarioReset,
    highlightedItemId,
    revealedObjectIds,
  } = scenario;
  const { canSelectPageItem, resetNavigation, selectPageItem } = navigation;
  const [pendingPageItemSelectionId, setPendingPageItemSelectionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      pendingPageItemSelectionId === null ||
      !canSelectPageItem(pendingPageItemSelectionId)
    ) {
      return;
    }

    selectPageItem(pendingPageItemSelectionId);
    setPendingPageItemSelectionId(null);
  }, [canSelectPageItem, pendingPageItemSelectionId, selectPageItem]);

  const handleObjectCreated = useCallback(
    (id: string) => {
      revealObject(id);

      if (id === CRM_SCENARIO.companiesItemId) {
        selectPageItem(CRM_SCENARIO.companiesItemId);
        return;
      }

      setPendingPageItemSelectionId(id);
    },
    [revealObject, selectPageItem],
  );

  const handleChatReset = useCallback(() => {
    setPendingPageItemSelectionId(null);
    handleScenarioReset();
    resetNavigation();
  }, [handleScenarioReset, resetNavigation]);

  const handleJumpToConversationEnd = useCallback(() => {
    completeScenario();
    setPendingPageItemSelectionId(COMPLETED_ACTIVE_OBJECT_ID);
  }, [completeScenario]);

  return {
    ...navigation,
    handleChatReset,
    handleJumpToConversationEnd,
    handleObjectCreated,
    highlightedItemId,
    revealedObjectIds,
    sidebarEntries: scenario.workspaceEntries,
  };
}
