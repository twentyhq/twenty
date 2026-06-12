'use client';

import { styled } from '@linaria/react';
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconSearch,
} from '@tabler/icons-react';

import { AppleRainbowMark } from '@/icons';
import { mediaUp } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { SidebarControls } from './sidebar-controls';
import { SidebarFolder } from './sidebar-folder';
import { SidebarItem } from './sidebar-item';
import { renderPreviewIcon } from '../primitives/preview-icon';
import { PREVIEW_COLORS } from '../preview-colors';
import { isSidebarFolder } from './is-sidebar-folder';
import { type SidebarEntry, type SidebarItemDef } from '../types';

const theme = APP_PREVIEW_THEME;

const SidebarPanel = styled.aside`
  background: transparent;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  padding: 8px 4px;
  row-gap: 8px;
  width: 48px;

  ${mediaUp('md')} {
    &[data-desktop-mode='expanded'] {
      padding: 12px 8px;
      row-gap: 12px;
      width: ${theme.chrome.navigationDrawerWidthPx}px;
    }
  }
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  padding: 8px 4px;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      flex-direction: row;
      justify-content: space-between;
      row-gap: 0;
    }
  }
`;

const HeaderLeft = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      column-gap: 8px;
      justify-content: flex-start;
      width: auto;
    }
  }
`;

const WorkspaceName = styled.span`
  display: none;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      display: block;
      color: ${PREVIEW_COLORS.text};
      font-family: ${theme.font.family};
      font-size: ${theme.font.sizePx.md}px;
      font-weight: ${theme.font.weight.medium};
      line-height: 1.4;
    }
  }
`;

const DesktopOnly = styled.span`
  display: none;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      display: flex;
    }
  }
`;

const HeaderRight = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      column-gap: 8px;
      flex-direction: row;
    }
  }
`;

const SectionLabelRow = styled.div`
  align-items: center;
  display: flex;
  height: 28px;
  padding-left: 4px;
  padding-right: 2px;
`;

const SectionLabel = styled.span`
  color: ${PREVIEW_COLORS.textLight};
  font-family: ${theme.font.family};
  font-size: 11px;
  font-weight: ${theme.font.weight.semiBold};
  line-height: 1;
`;

const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  row-gap: 2px;
`;

// Mobile renders the icon rail; desktop the expanded panel.
const RailOnly = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  row-gap: 8px;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      display: none;
    }
  }
`;

const DesktopContent = styled.div`
  display: none;

  ${mediaUp('md')} {
    [data-desktop-mode='expanded'] & {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-height: 0;
      row-gap: 12px;
    }
  }
`;

const RailIconSlot = styled.div`
  align-items: center;
  display: flex;
  height: 28px;
  justify-content: center;
  width: 100%;
`;

export type DesktopSidebarMode = 'expanded' | 'collapsed';

export function PreviewSidebar({
  desktopMode = 'expanded',
  favorites,
  highlightedItemId = null,
  onSelectPageItem,
  onToggleFolder,
  openFolderIds,
  selectedItemId,
  workspace,
}: {
  desktopMode?: DesktopSidebarMode;
  favorites: SidebarItemDef[];
  highlightedItemId?: string | null;
  onSelectPageItem?: (itemId: string) => void;
  onToggleFolder?: (folderId: string) => void;
  openFolderIds?: string[];
  selectedItemId: string;
  workspace: SidebarEntry[];
}) {
  const visibleWorkspace = workspace.filter((entry) =>
    isSidebarFolder(entry) ? true : !entry.hidden,
  );
  const railItems = visibleWorkspace.filter(
    (entry): entry is SidebarItemDef => !isSidebarFolder(entry),
  );

  return (
    <SidebarPanel aria-hidden data-desktop-mode={desktopMode}>
      <Header>
        <HeaderLeft>
          <AppleRainbowMark sizePx={16} />
          <WorkspaceName>Apple</WorkspaceName>
          <DesktopOnly>
            <IconChevronDown color={PREVIEW_COLORS.textExtraLight} size={16} />
          </DesktopOnly>
        </HeaderLeft>
        <HeaderRight>
          <IconSearch color={PREVIEW_COLORS.textSecondary} size={16} />
          <DesktopOnly>
            <IconLayoutSidebarLeftCollapse
              color={PREVIEW_COLORS.textSecondary}
              size={16}
            />
          </DesktopOnly>
        </HeaderRight>
      </Header>
      <SidebarControls />
      <RailOnly>
        {railItems.map((item) => (
          <RailIconSlot data-rail-item-id={item.id} key={item.id}>
            {renderPreviewIcon(item.icon)}
          </RailIconSlot>
        ))}
      </RailOnly>
      <DesktopContent>
        <div>
          <SectionLabelRow>
            <SectionLabel>Favorites</SectionLabel>
          </SectionLabelRow>
          <SectionStack>
            {favorites.map((item) => (
              <SidebarItem
                active={item.id === selectedItemId}
                item={item}
                key={item.id}
                onSelect={onSelectPageItem}
              />
            ))}
          </SectionStack>
        </div>
        <div>
          <SectionLabelRow>
            <SectionLabel>Workspace</SectionLabel>
          </SectionLabelRow>
          <SectionStack>
            {visibleWorkspace.map((entry) =>
              isSidebarFolder(entry) ? (
                <SidebarFolder
                  expanded={openFolderIds?.includes(entry.id) ?? false}
                  folder={entry}
                  key={entry.id}
                  onSelectItem={onSelectPageItem}
                  onToggleExpanded={
                    onToggleFolder ? () => onToggleFolder(entry.id) : undefined
                  }
                  selectedItemId={selectedItemId}
                />
              ) : (
                <SidebarItem
                  active={entry.id === selectedItemId}
                  highlighted={entry.id === highlightedItemId}
                  item={entry}
                  key={entry.id}
                  onSelect={onSelectPageItem}
                />
              ),
            )}
          </SectionStack>
        </div>
      </DesktopContent>
    </SidebarPanel>
  );
}
