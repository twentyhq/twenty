import type {
  SidebarEntry,
  SidebarFolderDef,
  SidebarItemDef,
  SidebarPageItemDef,
} from '../types';

import { isFolder } from './is-folder';

type SidebarIndex = {
  foldersById: Map<string, SidebarFolderDef>;
  itemsById: Map<string, SidebarItemDef>;
  pageItemsById: Map<string, SidebarPageItemDef>;
  parentFolderIdsByItemId: Map<string, string>;
};

function isPageItem(item: SidebarItemDef): item is SidebarPageItemDef {
  return item.page !== undefined;
}

function registerUniqueId(
  seenIds: Set<string>,
  id: string,
  context: string,
): void {
  if (seenIds.has(id)) {
    throw new Error(
      `AppPreview sidebar contains a duplicate id "${id}" in ${context}.`,
    );
  }

  seenIds.add(id);
}

function indexEntries(
  entries: SidebarEntry[],
  context: string,
  seenIds: Set<string>,
): SidebarIndex {
  const foldersById = new Map<string, SidebarFolderDef>();
  const itemsById = new Map<string, SidebarItemDef>();
  const pageItemsById = new Map<string, SidebarPageItemDef>();
  const parentFolderIdsByItemId = new Map<string, string>();

  for (const entry of entries) {
    if (isFolder(entry)) {
      registerUniqueId(seenIds, entry.id, `${context} folder`);
      foldersById.set(entry.id, entry);

      for (const item of entry.items) {
        registerUniqueId(
          seenIds,
          item.id,
          `${context} folder "${entry.id}" child item`,
        );
        itemsById.set(item.id, item);
        pageItemsById.set(item.id, item);
        parentFolderIdsByItemId.set(item.id, entry.id);
      }

      continue;
    }

    registerUniqueId(seenIds, entry.id, `${context} item`);
    itemsById.set(entry.id, entry);

    if (isPageItem(entry)) {
      pageItemsById.set(entry.id, entry);
    }
  }

  return {
    foldersById,
    itemsById,
    pageItemsById,
    parentFolderIdsByItemId,
  };
}

type SidebarIndexSource = {
  favorites: SidebarItemDef[];
  workspace: SidebarEntry[];
};

export function buildSidebarIndex({
  favorites,
  workspace,
}: SidebarIndexSource): SidebarIndex {
  const seenIds = new Set<string>();
  const favoriteIndex = indexEntries(favorites, 'favorites', seenIds);
  const workspaceIndex = indexEntries(workspace, 'workspace', seenIds);

  return {
    foldersById: workspaceIndex.foldersById,
    itemsById: new Map([
      ...favoriteIndex.itemsById.entries(),
      ...workspaceIndex.itemsById.entries(),
    ]),
    pageItemsById: new Map([
      ...favoriteIndex.pageItemsById.entries(),
      ...workspaceIndex.pageItemsById.entries(),
    ]),
    parentFolderIdsByItemId: workspaceIndex.parentFolderIdsByItemId,
  };
}
