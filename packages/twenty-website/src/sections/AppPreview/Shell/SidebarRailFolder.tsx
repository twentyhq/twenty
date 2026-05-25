'use client';

import { styled } from '@linaria/react';

import type { SidebarFolderDef } from '../types';
import { SidebarRailItem } from './SidebarRailItem';

const RailChildStack = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  padding-top: 4px;
`;

type SidebarRailFolderProps = {
  collapsedOpenFolderId?: string;
  folder: SidebarFolderDef;
  highlightedItemId?: string;
  onSelectFolder: (folderId: string, firstChildItemId: string) => void;
  onSelectPageItem: (itemId: string, folderId?: string) => void;
  selectedItemId: string;
};

export function SidebarRailFolder({
  collapsedOpenFolderId,
  folder,
  highlightedItemId,
  onSelectFolder,
  onSelectPageItem,
  selectedItemId,
}: SidebarRailFolderProps) {
  const firstChild = folder.items[0];
  const isExpanded = collapsedOpenFolderId === folder.id;
  const hasActiveChild = folder.items.some(
    (item) => item.id === selectedItemId,
  );

  return (
    <div>
      <SidebarRailItem
        active={isExpanded || hasActiveChild}
        highlighted={highlightedItemId === folder.id}
        item={folder}
        onSelect={
          firstChild
            ? () => onSelectFolder(folder.id, firstChild.id)
            : undefined
        }
      />
      {isExpanded ? (
        <RailChildStack>
          {folder.items.map((item) => (
            <SidebarRailItem
              active={selectedItemId === item.id}
              child
              highlighted={highlightedItemId === item.id}
              item={item}
              key={item.id}
              onSelect={(itemId) => onSelectPageItem(itemId, folder.id)}
            />
          ))}
        </RailChildStack>
      ) : null}
    </div>
  );
}
