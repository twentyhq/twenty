'use client';

import { styled } from '@linaria/react';

import type { SidebarEntry } from '../types';
import { isFolder } from './is-folder';
import { SidebarRailFolder } from './SidebarRailFolder';
import { SidebarRailItem } from './SidebarRailItem';

const WorkspaceRail = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
`;

const WorkspaceRailScroll = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  row-gap: 6px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

type SidebarRailWorkspaceProps = {
  collapsedOpenFolderId?: string;
  highlightedItemId?: string;
  onSelectFolder: (folderId: string, firstChildItemId: string) => void;
  onSelectPageItem: (itemId: string, folderId?: string) => void;
  selectedItemId: string;
  workspaceNav: SidebarEntry[];
};

export function SidebarRailWorkspace({
  collapsedOpenFolderId,
  highlightedItemId,
  onSelectFolder,
  onSelectPageItem,
  selectedItemId,
  workspaceNav,
}: SidebarRailWorkspaceProps) {
  return (
    <WorkspaceRail>
      <WorkspaceRailScroll>
        {workspaceNav.map((entry) => {
          if (!isFolder(entry)) {
            return (
              <SidebarRailItem
                active={selectedItemId === entry.id}
                highlighted={highlightedItemId === entry.id}
                item={entry}
                key={entry.id}
                onSelect={(itemId) => onSelectPageItem(itemId)}
              />
            );
          }

          return (
            <SidebarRailFolder
              collapsedOpenFolderId={collapsedOpenFolderId}
              folder={entry}
              highlightedItemId={highlightedItemId}
              key={entry.id}
              onSelectFolder={onSelectFolder}
              onSelectPageItem={onSelectPageItem}
              selectedItemId={selectedItemId}
            />
          );
        })}
      </WorkspaceRailScroll>
    </WorkspaceRail>
  );
}
