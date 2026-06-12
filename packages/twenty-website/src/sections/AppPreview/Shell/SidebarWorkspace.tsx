'use client';

import { styled } from '@linaria/react';

import type { SidebarEntry } from '../types';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';
import { isFolder } from './is-folder';
import { SidebarDesktopFolder } from './SidebarDesktopFolder';
import { SidebarDesktopItem } from './SidebarDesktopItem';

const WorkspaceSection = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
`;

const WorkspaceScroll = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  row-gap: 2px;
  scrollbar-width: none;

  padding-bottom: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const WorkspaceLabelRow = styled.div`
  align-items: center;
  display: flex;
  height: 28px;
  padding-left: 4px;
  padding-right: 2px;
`;

const WorkspaceLabel = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
`;

type SidebarWorkspaceProps = {
  highlightedItemId?: string;
  onSelectPageItem: (itemId: string) => void;
  onToggleFolder: (folderId: string) => void;
  openFolderIds: string[];
  selectedItemId: string;
  workspaceNav: SidebarEntry[];
};

export function SidebarWorkspace({
  highlightedItemId,
  onSelectPageItem,
  onToggleFolder,
  openFolderIds,
  selectedItemId,
  workspaceNav,
}: SidebarWorkspaceProps) {
  return (
    <WorkspaceSection>
      <WorkspaceLabelRow>
        <WorkspaceLabel>Workspace</WorkspaceLabel>
      </WorkspaceLabelRow>
      <WorkspaceScroll>
        {workspaceNav.map((entry) => {
          if (isFolder(entry)) {
            return (
              <SidebarDesktopFolder
                expanded={openFolderIds.includes(entry.id)}
                folder={entry}
                highlightedItemId={highlightedItemId}
                key={entry.id}
                onSelectItem={onSelectPageItem}
                onToggleExpanded={() => onToggleFolder(entry.id)}
                selectedItemId={selectedItemId}
              />
            );
          }

          return (
            <SidebarDesktopItem
              highlightedItemId={highlightedItemId}
              item={entry}
              key={entry.id}
              onSelect={onSelectPageItem}
              selectedItemId={selectedItemId}
            />
          );
        })}
      </WorkspaceScroll>
    </WorkspaceSection>
  );
}
