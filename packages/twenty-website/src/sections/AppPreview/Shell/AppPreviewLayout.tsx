'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { COLORS } from '../Shared/utils/app-preview-theme';
import type { PageDefinition, SidebarEntry, SidebarItemDef } from '../types';
import {
  AppPreviewSidebar,
  type DesktopSidebarMode,
} from './AppPreviewSidebar';
import { AppPreviewNavbar } from './AppPreviewNavbar';
import { AppPreviewViewbar } from './AppPreviewViewbar';
import { renderPageDefinition } from './PageRenderers';

const AppLayout = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const RightPane = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  padding-bottom: 12px;
  padding-left: 0;
  padding-right: 8px;
  padding-top: 12px;
  row-gap: 12px;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-right: 12px;
  }
`;

const ContentRow = styled.div<{ $hasAside: boolean }>`
  column-gap: ${({ $hasAside }) => ($hasAside ? '8px' : '0')};
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
`;

const IndexSurface = styled.div<{ $compactWorkflowPage: boolean }>`
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  [data-workflow-canvas] {
    left: ${({ $compactWorkflowPage }) =>
      $compactWorkflowPage ? '0' : 'auto'};
    transform: ${({ $compactWorkflowPage }) =>
      $compactWorkflowPage ? 'scale(0.78) translateX(-6%)' : 'none'};
    transform-origin: ${({ $compactWorkflowPage }) =>
      $compactWorkflowPage ? 'top left' : 'center center'};
  }
`;

const ASIDE_WIDTH = 280;
const ASIDE_GAP = 8;

const AsideSlot = styled.div`
  flex: 0 0 auto;
  overflow: hidden;
`;

// Phone (<600px) AI experience: drop the CRM sidebar/board and let the AI panel
// be the whole window.
const PanelOnlyRoot = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

type AppPreviewLayoutProps = {
  activeItem?: SidebarItemDef;
  activeItemId: string;
  activeItemLabel: string;
  asideProgress?: number;
  compactWorkflowPage?: boolean;
  desktopSidebarMode?: DesktopSidebarMode;
  favorites: SidebarItemDef[];
  highlightedItemId?: string;
  navbarLabel?: string;
  onSelectPageItem: (itemId: string) => void;
  onToggleFolder: (folderId: string) => void;
  openFolderIds: string[];
  page: PageDefinition;
  panelOnly?: boolean;
  revealedObjectIds: string[];
  rightAside?: ReactNode;
  workspaceEntries: SidebarEntry[];
};

export function AppPreviewLayout({
  activeItem,
  activeItemId,
  activeItemLabel,
  asideProgress = 1,
  compactWorkflowPage = false,
  desktopSidebarMode = 'expanded',
  favorites,
  highlightedItemId,
  navbarLabel,
  onSelectPageItem,
  onToggleFolder,
  openFolderIds,
  page,
  panelOnly = false,
  revealedObjectIds,
  rightAside,
  workspaceEntries,
}: AppPreviewLayoutProps) {
  if (panelOnly && rightAside !== undefined) {
    return <PanelOnlyRoot>{rightAside}</PanelOnlyRoot>;
  }

  const activeHeader = page.header;
  const showViewBar =
    page.type !== 'dashboard' &&
    page.type !== 'record' &&
    page.type !== 'workflow';
  const resolvedDesktopSidebarMode =
    page.type === 'record' ? 'collapsed' : desktopSidebarMode;
  const resolvedNavbarLabel = navbarLabel ?? activeItemLabel;

  return (
    <AppLayout>
      <AppPreviewSidebar
        desktopSidebarMode={resolvedDesktopSidebarMode}
        favoritesNav={favorites}
        highlightedItemId={highlightedItemId}
        onSelectPageItem={onSelectPageItem}
        onToggleFolder={onToggleFolder}
        openFolderIds={openFolderIds}
        selectedItemId={activeItemId}
        workspaceNav={workspaceEntries}
      />

      <RightPane>
        <AppPreviewNavbar
          activeItem={activeItem}
          activeItemLabel={resolvedNavbarLabel}
          navbarActions={activeHeader?.navbarActions}
          revealedObjectIds={revealedObjectIds}
        />

        <ContentRow $hasAside={false}>
          <IndexSurface $compactWorkflowPage={compactWorkflowPage}>
            {showViewBar ? (
              <AppPreviewViewbar
                actions={activeHeader?.actions ?? []}
                count={activeHeader?.count}
                pageType={page.type}
                showListIcon={activeHeader?.showListIcon ?? false}
                title={activeHeader?.title ?? activeItemLabel}
              />
            ) : null}

            {renderPageDefinition(page, onSelectPageItem)}
          </IndexSurface>

          {rightAside !== undefined ? (
            <AsideSlot
              style={{
                marginLeft: `${ASIDE_GAP * Math.max(0, Math.min(1, asideProgress))}px`,
                width: `${ASIDE_WIDTH * Math.max(0, Math.min(1, asideProgress))}px`,
              }}
            >
              {rightAside}
            </AsideSlot>
          ) : null}
        </ContentRow>
      </RightPane>
    </AppLayout>
  );
}
