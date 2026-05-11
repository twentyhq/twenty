'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import type { SidebarEntry, SidebarItemDef } from '../types';
import { SidebarControls } from './SidebarControls';
import { SidebarHeader } from './SidebarHeader';
import { SidebarItem } from './SidebarItem';
import { isFolder } from './is-folder';
import { APP_FONT, COLORS } from '../Shared/utils/app-preview-theme';

const SidebarPanel = styled.aside`
  background: transparent;
  display: grid;
  flex: 0 0 48px;
  gap: 8px;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 0;
  padding: 8px 4px;
  width: 48px;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-basis: 220px;
    gap: 12px;
    padding: 12px 8px;
    width: 220px;
  }
`;

const SidebarScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SidebarSection = styled.div`
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
`;

const SidebarSectionLabel = styled.span<{ $workspace?: boolean }>`
  color: ${COLORS.textLight};
  display: none;
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: ${({ $workspace }) => ($workspace ? '4px 4px 8px' : '0 4px 4px')};

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

type AppPreviewSidebarProps = {
  favoritesNav?: SidebarItemDef[];
  highlightedItemId?: string;
  onSelectLabel: (label: string) => void;
  onToggleFolder: (folderId: string) => void;
  openFolderIds: string[];
  selectedLabel: string;
  workspaceName: string;
  workspaceNav: SidebarEntry[];
};

export function AppPreviewSidebar({
  favoritesNav,
  highlightedItemId,
  onSelectLabel,
  onToggleFolder,
  openFolderIds,
  selectedLabel,
  workspaceName,
  workspaceNav,
}: AppPreviewSidebarProps) {
  const renderSidebarEntry = (entry: SidebarEntry): ReactNode => {
    if (isFolder(entry)) {
      return (
        <SidebarItem
          collapsible
          expanded={openFolderIds.includes(entry.id)}
          highlightedItemId={highlightedItemId}
          key={entry.id}
          item={{
            id: entry.id,
            label: entry.label,
            icon: entry.icon,
            showChevron: entry.showChevron,
            children: entry.items,
          }}
          onSelect={onSelectLabel}
          onToggleExpanded={() => onToggleFolder(entry.id)}
          selectedLabel={selectedLabel}
        />
      );
    }

    return (
      <SidebarItem
        highlightedItemId={highlightedItemId}
        key={entry.id}
        item={entry}
        onSelect={onSelectLabel}
        selectedLabel={selectedLabel}
      />
    );
  };

  return (
    <SidebarPanel>
      <SidebarHeader workspaceName={workspaceName} />

      <SidebarControls />

      <SidebarScroll>
        {favoritesNav && favoritesNav.length > 0 ? (
          <SidebarSection>
            <SidebarSectionLabel>Favorites</SidebarSectionLabel>
            {favoritesNav.map((item) => (
              <SidebarItem
                highlightedItemId={highlightedItemId}
                key={item.id}
                item={item}
                onSelect={onSelectLabel}
                selectedLabel={selectedLabel}
              />
            ))}
          </SidebarSection>
        ) : null}
        <SidebarSection>
          <SidebarSectionLabel $workspace>Workspace</SidebarSectionLabel>
          {workspaceNav.map(renderSidebarEntry)}
        </SidebarSection>
      </SidebarScroll>
    </SidebarPanel>
  );
}
