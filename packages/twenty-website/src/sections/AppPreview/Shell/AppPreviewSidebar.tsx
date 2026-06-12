'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useMemo } from 'react';

import type { SidebarEntry, SidebarItemDef } from '../types';
import { SidebarFavorites } from './SidebarFavorites';
import { SidebarControls } from './SidebarControls';
import { SidebarHeader } from './SidebarHeader';
import { buildSidebarIndex } from './build-sidebar-index';
import { SidebarRailFavorites } from './SidebarRailFavorites';
import { SidebarRailWorkspace } from './SidebarRailWorkspace';
import { SidebarWorkspace } from './SidebarWorkspace';

const SidebarPanel = styled.aside<{ $desktopExpanded: boolean }>`
  background: transparent;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  padding-bottom: 8px;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 8px;
  row-gap: 8px;
  width: 48px;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: 12px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 12px;
    width: ${({ $desktopExpanded }) => ($desktopExpanded ? '220px' : '48px')};
  }
`;

const RailNavigation = styled.div<{ $desktopExpanded: boolean }>`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  row-gap: 8px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'none' : 'flex')};
  }
`;

const DesktopContent = styled.div<{ $desktopExpanded: boolean }>`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: ${({ $desktopExpanded }) => ($desktopExpanded ? 'flex' : 'none')};
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    row-gap: 12px;
  }
`;

const DesktopSections = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  row-gap: 12px;
`;

export type DesktopSidebarMode = 'collapsed' | 'expanded';

type AppPreviewSidebarProps = {
  desktopSidebarMode?: DesktopSidebarMode;
  favoritesNav: SidebarItemDef[];
  highlightedItemId?: string;
  onSelectPageItem: (itemId: string) => void;
  onToggleFolder: (folderId: string) => void;
  openFolderIds: string[];
  selectedItemId: string;
  workspaceNav: SidebarEntry[];
};

export function AppPreviewSidebar({
  desktopSidebarMode = 'expanded',
  favoritesNav,
  highlightedItemId,
  onSelectPageItem,
  onToggleFolder,
  openFolderIds,
  selectedItemId,
  workspaceNav,
}: AppPreviewSidebarProps) {
  const desktopExpanded = desktopSidebarMode === 'expanded';
  const workspaceIndex = useMemo(
    () =>
      buildSidebarIndex({
        favorites: [],
        workspace: workspaceNav,
      }),
    [workspaceNav],
  );
  const collapsedOpenFolderId =
    workspaceIndex.parentFolderIdsByItemId.get(selectedItemId) ??
    openFolderIds.at(-1);

  const closeCollapsedFolders = (nextOpenFolderId?: string) => {
    openFolderIds
      .filter((folderId) => folderId !== nextOpenFolderId)
      .forEach((folderId) => onToggleFolder(folderId));
  };

  const handleCollapsedFavoriteSelect = (itemId: string) => {
    closeCollapsedFolders();
    onSelectPageItem(itemId);
  };

  const handleCollapsedWorkspaceSelect = (
    itemId: string,
    folderId?: string,
  ) => {
    closeCollapsedFolders(folderId);
    onSelectPageItem(itemId);
  };

  const handleCollapsedFolderSelect = (
    folderId: string,
    firstChildItemId: string,
  ) => {
    closeCollapsedFolders(folderId);

    if (!openFolderIds.includes(folderId)) {
      onToggleFolder(folderId);
    }

    onSelectPageItem(firstChildItemId);
  };

  return (
    <SidebarPanel $desktopExpanded={desktopExpanded}>
      <SidebarHeader desktopExpanded={desktopExpanded} />
      <RailNavigation $desktopExpanded={desktopExpanded}>
        <SidebarControls desktopExpanded={desktopExpanded} />
        <SidebarRailFavorites
          favoritesNav={favoritesNav}
          highlightedItemId={highlightedItemId}
          onSelectPageItem={handleCollapsedFavoriteSelect}
          selectedItemId={selectedItemId}
        />
        <SidebarRailWorkspace
          collapsedOpenFolderId={collapsedOpenFolderId}
          highlightedItemId={highlightedItemId}
          onSelectFolder={handleCollapsedFolderSelect}
          onSelectPageItem={handleCollapsedWorkspaceSelect}
          selectedItemId={selectedItemId}
          workspaceNav={workspaceNav}
        />
      </RailNavigation>
      <DesktopContent $desktopExpanded={desktopExpanded}>
        <SidebarControls desktopExpanded={desktopExpanded} />
        <DesktopSections>
          <SidebarFavorites
            favoritesNav={favoritesNav}
            highlightedItemId={highlightedItemId}
            onSelectPageItem={onSelectPageItem}
            selectedItemId={selectedItemId}
          />
          <SidebarWorkspace
            highlightedItemId={highlightedItemId}
            onSelectPageItem={onSelectPageItem}
            onToggleFolder={onToggleFolder}
            openFolderIds={openFolderIds}
            selectedItemId={selectedItemId}
            workspaceNav={workspaceNav}
          />
        </DesktopSections>
      </DesktopContent>
    </SidebarPanel>
  );
}
