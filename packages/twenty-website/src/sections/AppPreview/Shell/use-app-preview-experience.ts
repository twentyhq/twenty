import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AppPreviewConfig, SidebarEntry, SidebarItemDef } from '../types';
import { COMPANIES_ITEM_ID } from '../Data/rocket-object';
import {
  COMPLETED_ACTIVE_OBJECT_ID,
  useAppPreviewCrmScenario,
} from './use-app-preview-crm-scenario';
import { useAppPreviewNavigation } from './use-app-preview-navigation';

function buildItemListSignature(items: SidebarItemDef[]) {
  return items.map((item) => item.id).join('|');
}

function buildWorkspaceSignature(entries: SidebarEntry[]) {
  return entries
    .map((entry) =>
      'items' in entry
        ? `folder:${entry.id}[${entry.items.map((item) => item.id).join(',')}]`
        : `item:${entry.id}`,
    )
    .join('|');
}

function buildSidebarConfigResetKey(visual: AppPreviewConfig) {
  return [
    visual.sidebar.initialActiveItemId,
    visual.sidebar.initialOpenFolderIds.join('|'),
    buildItemListSignature(visual.sidebar.favorites),
    buildWorkspaceSignature(visual.sidebar.workspace),
  ].join('::');
}

export function useAppPreviewExperience(visual: AppPreviewConfig) {
  const sidebarConfigResetKey = useMemo(
    () => buildSidebarConfigResetKey(visual),
    [visual],
  );
  const previousSidebarConfigResetKeyRef = useRef(sidebarConfigResetKey);
  const scenario = useAppPreviewCrmScenario(visual.sidebar.workspace);
  const navigation = useAppPreviewNavigation({
    defaultViewbarActions: visual.defaultViewbarActions,
    sidebar: {
      favorites: visual.sidebar.favorites,
      initialActiveItemId: visual.sidebar.initialActiveItemId,
      initialOpenFolderIds: visual.sidebar.initialOpenFolderIds,
      workspace: scenario.workspaceEntries,
    },
  });
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

  useEffect(() => {
    if (previousSidebarConfigResetKeyRef.current === sidebarConfigResetKey) {
      return;
    }

    previousSidebarConfigResetKeyRef.current = sidebarConfigResetKey;
    setPendingPageItemSelectionId(null);
    handleScenarioReset();
    resetNavigation();
  }, [handleScenarioReset, resetNavigation, sidebarConfigResetKey]);

  const handleObjectCreated = useCallback(
    (id: string) => {
      revealObject(id);

      if (id === COMPANIES_ITEM_ID) {
        selectPageItem(COMPANIES_ITEM_ID);
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
  };
}
