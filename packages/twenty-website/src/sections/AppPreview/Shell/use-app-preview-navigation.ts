import { useCallback, useMemo, useState } from 'react';

import { normalizePage } from '../Data/normalize-page';
import type {
  AppPreviewConfig,
  AppPreviewSidebarConfig,
  PageDefinition,
  SidebarEntry,
  SidebarItemDef,
  SidebarPageItemDef,
} from '../types';
import { buildSidebarIndex } from './build-sidebar-index';

const DEFAULT_TABLE_WIDTH = 1700;

function getInitialOpenFolderIds(
  sidebar: AppPreviewSidebarConfig,
  activeItemId: string,
  workspaceEntries: SidebarEntry[],
) {
  const navigationIndex = buildSidebarIndex({
    favorites: sidebar.favorites,
    workspace: workspaceEntries,
  });

  const defaultActiveItem = navigationIndex.pageItemsById.get(activeItemId);

  if (!defaultActiveItem) {
    throw new Error(
      `AppPreviewConfig references unknown initial active item id "${activeItemId}".`,
    );
  }

  for (const folderId of sidebar.initialOpenFolderIds) {
    if (!navigationIndex.foldersById.has(folderId)) {
      throw new Error(
        `AppPreviewConfig references unknown initial open folder id "${folderId}".`,
      );
    }
  }

  const openFolderIds = new Set(sidebar.initialOpenFolderIds);
  const parentFolderId =
    navigationIndex.parentFolderIdsByItemId.get(activeItemId);

  if (parentFolderId) {
    openFolderIds.add(parentFolderId);
  }

  return [...openFolderIds];
}

type AppPreviewNavigationConfig = Pick<
  AppPreviewConfig,
  'defaultViewbarActions'
> & {
  sidebar: Pick<
    AppPreviewSidebarConfig,
    'favorites' | 'initialActiveItemId' | 'initialOpenFolderIds'
  > & {
    workspace: SidebarEntry[];
  };
};

type AppPreviewNavigationState = {
  activeItem: SidebarPageItemDef;
  activeItemId: string;
  activeItemLabel: string;
  activePage: PageDefinition;
  canSelectPageItem: (itemId: string) => boolean;
  favorites: SidebarItemDef[];
  openFolderIds: string[];
  resetNavigation: () => void;
  selectPageItem: (itemId: string) => void;
  toggleFolder: (folderId: string) => void;
  workspaceEntries: SidebarEntry[];
};

function getVisibleSidebarItems(items: SidebarItemDef[]) {
  return items.filter((item) => !item.hidden);
}

function getVisibleSidebarEntries(entries: SidebarEntry[]): SidebarEntry[] {
  return entries.reduce<SidebarEntry[]>((visibleEntries, entry) => {
    if ('items' in entry) {
      const visibleItems = entry.items.filter((item) => !item.hidden);

      if (visibleItems.length === 0) {
        return visibleEntries;
      }

      visibleEntries.push({ ...entry, items: visibleItems });
      return visibleEntries;
    }

    if (!entry.hidden) {
      visibleEntries.push(entry);
    }

    return visibleEntries;
  }, []);
}

export function useAppPreviewNavigation(
  visual: AppPreviewNavigationConfig,
): AppPreviewNavigationState {
  const defaultActiveItemId = visual.sidebar.initialActiveItemId;

  const navigationIndex = useMemo(
    () =>
      buildSidebarIndex({
        favorites: visual.sidebar.favorites,
        workspace: visual.sidebar.workspace,
      }),
    [visual.sidebar.favorites, visual.sidebar.workspace],
  );

  const [activeItemId, setActiveItemId] = useState(defaultActiveItemId);
  const [openFolderIds, setOpenFolderIds] = useState(() =>
    getInitialOpenFolderIds(
      visual.sidebar,
      defaultActiveItemId,
      visual.sidebar.workspace,
    ),
  );

  const pageDefaults = useMemo(
    () => ({
      defaultActions: visual.defaultViewbarActions,
      defaultTableWidth: DEFAULT_TABLE_WIDTH,
    }),
    [visual.defaultViewbarActions],
  );

  const activeItem = navigationIndex.pageItemsById.get(activeItemId);

  if (!activeItem) {
    throw new Error(
      `AppPreview attempted to select unknown page item id "${activeItemId}".`,
    );
  }

  const activePage = normalizePage(activeItem, pageDefaults);

  const canSelectPageItem = useCallback(
    (itemId: string) => navigationIndex.pageItemsById.has(itemId),
    [navigationIndex.pageItemsById],
  );

  const selectPageItem = useCallback(
    (itemId: string) => {
      if (!canSelectPageItem(itemId)) {
        throw new Error(
          `AppPreview attempted to select unknown page item id "${itemId}".`,
        );
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
    [canSelectPageItem, navigationIndex.parentFolderIdsByItemId],
  );

  const toggleFolder = useCallback(
    (folderId: string) => {
      if (!navigationIndex.foldersById.has(folderId)) {
        throw new Error(
          `AppPreview attempted to toggle unknown folder id "${folderId}".`,
        );
      }

      setOpenFolderIds((current) =>
        current.includes(folderId)
          ? current.filter((id) => id !== folderId)
          : [...current, folderId],
      );
    },
    [navigationIndex.foldersById],
  );

  const resetNavigation = useCallback(() => {
    setActiveItemId(defaultActiveItemId);
    setOpenFolderIds(
      getInitialOpenFolderIds(
        visual.sidebar,
        defaultActiveItemId,
        visual.sidebar.workspace,
      ),
    );
  }, [defaultActiveItemId, visual.sidebar]);

  return {
    activeItem,
    activeItemId,
    activeItemLabel: activeItem.label,
    activePage,
    canSelectPageItem,
    favorites: getVisibleSidebarItems(visual.sidebar.favorites),
    openFolderIds,
    resetNavigation,
    selectPageItem,
    toggleFolder,
    workspaceEntries: getVisibleSidebarEntries(visual.sidebar.workspace),
  };
}
