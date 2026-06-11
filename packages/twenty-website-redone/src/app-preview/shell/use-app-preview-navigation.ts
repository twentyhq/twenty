'use client';

import { useCallback, useMemo, useState } from 'react';

import { isSidebarFolder } from './is-sidebar-folder';
import { normalizePage } from '../data/normalize-page';
import {
  type AppPreviewConfig,
  type PageDefinition,
  type SidebarEntry,
  type SidebarFolderDef,
  type SidebarItemDef,
  type SidebarPageItemDef,
} from '../types';

// The product table canvas the mockup was authored against: wider than
// the columns so the filler "+" column renders.
const DEFAULT_TABLE_WIDTH = 1700;

type SidebarIndex = {
  foldersById: Map<string, SidebarFolderDef>;
  pageItemsById: Map<string, SidebarPageItemDef>;
  parentFolderIdsByItemId: Map<string, string>;
};

function isPageItem(item: SidebarItemDef): item is SidebarPageItemDef {
  return item.page !== undefined;
}

function buildSidebarIndex(config: {
  favorites: SidebarItemDef[];
  workspace: SidebarEntry[];
}): SidebarIndex {
  const foldersById = new Map<string, SidebarFolderDef>();
  const pageItemsById = new Map<string, SidebarPageItemDef>();
  const parentFolderIdsByItemId = new Map<string, string>();
  const register = (item: SidebarItemDef, parentFolderId?: string) => {
    if (isPageItem(item)) {
      pageItemsById.set(item.id, item);
    }
    if (parentFolderId) {
      parentFolderIdsByItemId.set(item.id, parentFolderId);
    }
  };
  for (const item of config.favorites) {
    register(item);
  }
  for (const entry of config.workspace) {
    if (isSidebarFolder(entry)) {
      foldersById.set(entry.id, entry);
      for (const item of entry.items) {
        register(item, entry.id);
      }
      continue;
    }
    register(entry);
  }
  return { foldersById, pageItemsById, parentFolderIdsByItemId };
}

export type AppPreviewNavigation = {
  activeItem: SidebarPageItemDef;
  activeItemId: string;
  activePage: PageDefinition;
  openFolderIds: string[];
  selectPageItem: (itemId: string) => void;
  toggleFolder: (folderId: string) => void;
};

export function useAppPreviewNavigation(
  visual: AppPreviewConfig,
): AppPreviewNavigation {
  const navigationIndex = useMemo(
    () =>
      buildSidebarIndex({
        favorites: visual.sidebar.favorites,
        workspace: visual.sidebar.workspace,
      }),
    [visual.sidebar.favorites, visual.sidebar.workspace],
  );

  const [activeItemId, setActiveItemId] = useState(
    visual.sidebar.initialActiveItemId,
  );
  const [openFolderIds, setOpenFolderIds] = useState(() => {
    const open = new Set(visual.sidebar.initialOpenFolderIds);
    const parent = navigationIndex.parentFolderIdsByItemId.get(
      visual.sidebar.initialActiveItemId,
    );
    if (parent) {
      open.add(parent);
    }
    return [...open];
  });

  const activeItem = navigationIndex.pageItemsById.get(activeItemId);
  if (!activeItem) {
    throw new Error(
      `AppPreview attempted to select unknown page item id "${activeItemId}".`,
    );
  }

  const activePage = useMemo(
    () =>
      normalizePage(activeItem, {
        defaultActions: visual.defaultViewbarActions,
        defaultTableWidth: DEFAULT_TABLE_WIDTH,
      }),
    [activeItem, visual.defaultViewbarActions],
  );

  const selectPageItem = useCallback(
    (itemId: string) => {
      if (!navigationIndex.pageItemsById.has(itemId)) {
        return;
      }
      setActiveItemId(itemId);
      const containingFolderId =
        navigationIndex.parentFolderIdsByItemId.get(itemId);
      if (!containingFolderId) {
        return;
      }
      setOpenFolderIds((current) =>
        current.includes(containingFolderId)
          ? current
          : [...current, containingFolderId],
      );
    },
    [navigationIndex],
  );

  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }, []);

  return {
    activeItem,
    activeItemId,
    activePage,
    openFolderIds,
    selectPageItem,
    toggleFolder,
  };
}
