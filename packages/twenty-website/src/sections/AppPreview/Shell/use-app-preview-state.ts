import { useTimeoutRegistry } from '@/lib/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SidebarEntry, AppPreviewConfig } from '../types';
import { normalizePage } from '../Data/normalize-page';
import { findActiveItem } from './find-active-item';
import { findContainingFolderId } from './find-containing-folder-id';
import { isFolder } from './is-folder';
import {
  COMPANIES_ITEM_ID,
  COMPANIES_ITEM_LABEL,
  CRM_OBJECT_SEQUENCE,
} from '../Data/rocket-object';

const DEFAULT_TABLE_WIDTH = 1700;
const COMPLETED_CREATED_OBJECT_IDS = CRM_OBJECT_SEQUENCE.map(({ id }) => id);
const COMPLETED_REVEALED_OBJECT_IDS = [
  ...COMPLETED_CREATED_OBJECT_IDS,
  COMPANIES_ITEM_ID,
];
const COMPLETED_ACTIVE_OBJECT_LABEL =
  CRM_OBJECT_SEQUENCE.at(-1)?.label ?? COMPANIES_ITEM_LABEL;
const HIGHLIGHT_RESET_DELAY_MS = 2000;

export function useAppPreviewState(visual: AppPreviewConfig) {
  const timeoutRegistry = useTimeoutRegistry();
  const defaultActiveLabel =
    visual.favoritesNav?.find((item) => item.active)?.label ??
    visual.workspaceNav.find((entry) => !isFolder(entry) && entry.active)
      ?.label ??
    visual.workspaceNav[0]?.label ??
    '';

  const [activeLabel, setActiveLabel] = useState(defaultActiveLabel);
  const [createdObjectIds, setCreatedObjectIds] = useState<string[]>([]);
  const [revealedObjectIds, setRevealedObjectIds] = useState<string[]>([]);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [openFolderIds, setOpenFolderIds] = useState(() => {
    const activeFolderId = findContainingFolderId(
      visual.workspaceNav,
      defaultActiveLabel,
    );

    return visual.workspaceNav.flatMap((entry) => {
      if (!isFolder(entry)) {
        return [];
      }

      if (entry.defaultOpen || entry.id === activeFolderId) {
        return [entry.id];
      }

      return [];
    });
  });

  const pageDefaults = useMemo(
    () => ({
      defaultActions: visual.actions ?? [],
      defaultTableWidth: visual.tableWidth ?? DEFAULT_TABLE_WIDTH,
    }),
    [visual.actions, visual.tableWidth],
  );

  const workspaceNav = useMemo<SidebarEntry[]>(() => {
    if (createdObjectIds.length === 0) {
      return visual.workspaceNav;
    }

    const prepended = [...createdObjectIds]
      .reverse()
      .map(
        (id) =>
          CRM_OBJECT_SEQUENCE.find((entry) => entry.id === id)?.sidebarItem,
      )
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return [...prepended, ...visual.workspaceNav];
  }, [createdObjectIds, visual.workspaceNav]);

  const handleObjectCreated = useCallback((id: string) => {
    setRevealedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );

    if (id === COMPANIES_ITEM_ID) {
      setActiveLabel(COMPANIES_ITEM_LABEL);
      setHighlightedItemId(COMPANIES_ITEM_ID);
      return;
    }

    const entry = CRM_OBJECT_SEQUENCE.find((candidate) => candidate.id === id);

    if (!entry) {
      return;
    }

    setCreatedObjectIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setActiveLabel(entry.label);
    setHighlightedItemId(entry.id);
  }, []);

  const handleChatReset = useCallback(() => {
    setCreatedObjectIds([]);
    setRevealedObjectIds([]);
    setHighlightedItemId(null);
    setActiveLabel(defaultActiveLabel);
  }, [defaultActiveLabel]);

  const handleJumpToConversationEnd = useCallback(() => {
    setCreatedObjectIds(COMPLETED_CREATED_OBJECT_IDS);
    setRevealedObjectIds(COMPLETED_REVEALED_OBJECT_IDS);
    setHighlightedItemId(null);
    setActiveLabel(COMPLETED_ACTIVE_OBJECT_LABEL);
  }, []);

  useEffect(() => {
    if (highlightedItemId === null) {
      return undefined;
    }

    return timeoutRegistry.schedule(
      () => setHighlightedItemId(null),
      HIGHLIGHT_RESET_DELAY_MS,
    );
  }, [highlightedItemId, timeoutRegistry]);

  const activeItem = useMemo(
    () =>
      (visual.favoritesNav
        ? findActiveItem(visual.favoritesNav, activeLabel, pageDefaults)
        : undefined) ?? findActiveItem(workspaceNav, activeLabel, pageDefaults),
    [activeLabel, pageDefaults, visual.favoritesNav, workspaceNav],
  );

  const activePage = useMemo(
    () => (activeItem ? normalizePage(activeItem, pageDefaults) : null),
    [activeItem, pageDefaults],
  );

  const handleSelectLabel = useCallback(
    (label: string) => {
      setActiveLabel(label);

      const containingFolderId = findContainingFolderId(workspaceNav, label);

      if (!containingFolderId) {
        return;
      }

      setOpenFolderIds((current) =>
        current.includes(containingFolderId)
          ? current
          : [...current, containingFolderId],
      );
    },
    [workspaceNav],
  );

  const handleToggleFolder = useCallback((folderId: string) => {
    setOpenFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }, []);

  return {
    activeItem,
    activeLabel,
    activePage,
    handleChatReset,
    handleJumpToConversationEnd,
    handleObjectCreated,
    handleSelectLabel,
    handleToggleFolder,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    workspaceNav,
  };
}
