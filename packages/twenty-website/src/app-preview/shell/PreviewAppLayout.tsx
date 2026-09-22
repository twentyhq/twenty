'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { THEME_LIGHT } from 'twenty-ui/theme';

import { renderPage } from '../pages/RenderPage';
import { PreviewNavbar } from './PreviewNavbar';
import { PreviewSidebar, type DesktopSidebarMode } from './PreviewSidebar';
import { PreviewViewbar } from './PreviewViewbar';
import {
  type NavbarAction,
  type PageDefinition,
  type SidebarEntry,
  type SidebarItemDef,
} from '../types';

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

// The product's page card: flush against the drawer, separated from it by
// the drawer's rule and the card's leftward shadow only. The morph squeezes
// the named workflow's canvas into the compact frame.
const PageCard = styled.div`
  background: ${THEME_LIGHT.background.primary};
  box-shadow: ${THEME_LIGHT.boxShadow.sidebar};
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  &[data-compact-workflow] [data-workflow-canvas] {
    left: 0;
    transform: scale(0.78) translateX(-6%);
    transform-origin: top left;
  }
`;

// The Ask-AI aside floats in its own gutter beside the card, and reveals
// through one CSS custom property the scroll choreography writes (no
// per-frame React work); static mounts inherit the fully-open default.
const AsideSlot = styled.div`
  flex: 0 0 auto;
  margin: 12px 12px 12px calc(var(--ai-panel-progress, 1) * 8px);
  overflow: hidden;
  width: calc(var(--ai-panel-progress, 1) * 280px);
`;

// Phone (<600px) AI experience: drop the CRM sidebar/board and let the
// AI panel be the whole window.
const PanelOnlyRoot = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

export function PreviewAppLayout({
  activeItem,
  activeItemId,
  compactWorkflowPage = false,
  desktopSidebarMode = 'expanded',
  favorites,
  highlightedItemId = null,
  navbarActions,
  navbarLabel,
  onSelectPageItem,
  onToggleFolder,
  openFolderIds,
  page,
  panelOnly = false,
  revealedObjectIds,
  rightAside,
  workspaceEntries,
}: {
  activeItem?: SidebarItemDef;
  activeItemId: string;
  compactWorkflowPage?: boolean;
  desktopSidebarMode?: DesktopSidebarMode;
  favorites: SidebarItemDef[];
  highlightedItemId?: string | null;
  navbarActions?: NavbarAction[];
  navbarLabel: string;
  onSelectPageItem?: (itemId: string) => void;
  onToggleFolder?: (folderId: string) => void;
  openFolderIds?: string[];
  page: PageDefinition;
  panelOnly?: boolean;
  revealedObjectIds: string[];
  rightAside?: ReactNode;
  workspaceEntries: SidebarEntry[];
}) {
  if (panelOnly && rightAside !== undefined) {
    return <PanelOnlyRoot>{rightAside}</PanelOnlyRoot>;
  }

  const showViewbar =
    page.type !== 'dashboard' &&
    page.type !== 'record' &&
    page.type !== 'workflow';
  const resolvedDesktopSidebarMode =
    page.type === 'record' ? 'collapsed' : desktopSidebarMode;

  return (
    <AppLayout>
      <PreviewSidebar
        desktopMode={resolvedDesktopSidebarMode}
        favorites={favorites}
        highlightedItemId={highlightedItemId}
        onSelectPageItem={onSelectPageItem}
        onToggleFolder={onToggleFolder}
        openFolderIds={openFolderIds}
        selectedItemId={activeItemId}
        workspace={workspaceEntries}
      />
      <PageCard data-compact-workflow={compactWorkflowPage ? '' : undefined}>
        <PreviewNavbar
          activeItem={activeItem}
          activeItemLabel={navbarLabel}
          navbarActions={navbarActions}
          revealedObjectIds={revealedObjectIds}
        />
        {showViewbar ? (
          <PreviewViewbar
            actions={page.header.actions ?? []}
            count={page.header.count}
            pageType={page.type}
            showListIcon={page.header.showListIcon ?? false}
            title={page.header.title}
          />
        ) : null}
        {renderPage(page)}
      </PageCard>
      {rightAside !== undefined ? <AsideSlot>{rightAside}</AsideSlot> : null}
    </AppLayout>
  );
}
