'use client';

import { styled } from '@linaria/react';
import { useEffect } from 'react';

import { scheduleIdleTask } from '@/platform/motion';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import dynamic from 'next/dynamic';

import { APP_PREVIEW_CONFIG } from './data/sidebar-config';
import { KanbanPage } from './pages/kanban/kanban-page';
import { TablePage } from './pages/table/table-page';
import { WorkflowPage } from './pages/workflow/workflow-page';

// The dashboard (charts) is the heaviest page and never the landing view:
// it stays a deferred chunk, idle-preloaded after mount.
const DashboardPage = dynamic(
  () =>
    import('./pages/dashboard/dashboard-page').then(
      (module) => module.DashboardPage,
    ),
  { ssr: false },
);
import { PREVIEW_COLORS } from './preview-colors';
import { PreviewNavbar } from './shell/preview-navbar';
import { PreviewSidebar } from './shell/preview-sidebar';
import { PreviewViewbar } from './shell/preview-viewbar';
import { useAppPreviewNavigation } from './shell/use-app-preview-navigation';
import { AppWindow } from './stage/app-window';
import { ProductFrame } from './stage/product-frame';
import { WindowOrderProvider } from './stage/window-order-provider';
import { type PageDefinition } from './types';

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

  ${mediaUp('md')} {
    padding-right: 12px;
  }
`;

const ContentRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
`;

const IndexSurface = styled.div`
  background: ${PREVIEW_COLORS.background};
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: ${APP_PREVIEW_THEME.border.radius.md};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

function renderPage(page: PageDefinition) {
  switch (page.type) {
    case 'table':
      return <TablePage page={page} />;
    case 'kanban':
      return <KanbanPage page={page} />;
    case 'workflow':
      return <WorkflowPage page={page} />;
    case 'dashboard':
      return <DashboardPage page={page} />;
    // The record surface belongs to the product-page family (out of wave).
    default:
      return null;
  }
}

// The product mockup: navigable sidebar + the object pages, presented
// as a draggable/resizable desktop window (the old hero's identity).
// The AI Terminal joins the desktop with commits 7-8.
export function AppPreview({
  mode = 'windowed',
}: {
  mode?: 'static' | 'windowed';
}) {
  const { sidebar, defaultViewbarActions } = APP_PREVIEW_CONFIG;

  useEffect(
    () =>
      scheduleIdleTask(() => {
        void import('./pages/dashboard/dashboard-page');
      }),
    [],
  );
  const navigation = useAppPreviewNavigation(APP_PREVIEW_CONFIG);
  const { activeItem, activeItemId, activePage } = navigation;
  const showViewbar =
    activePage.type === 'table' || activePage.type === 'kanban';

  const appShell = (
    <AppLayout>
      <PreviewSidebar
        favorites={sidebar.favorites}
        onSelectPageItem={navigation.selectPageItem}
        openFolderIds={navigation.openFolderIds}
        onToggleFolder={navigation.toggleFolder}
        selectedItemId={activeItemId}
        workspace={sidebar.workspace}
      />
      <RightPane>
        <PreviewNavbar
          activeItem={activeItem}
          activeItemLabel={activeItem.label}
          navbarActions={activePage.header.navbarActions}
        />
        <ContentRow>
          <IndexSurface>
            {showViewbar ? (
              <PreviewViewbar
                actions={activePage.header.actions ?? defaultViewbarActions}
                count={activePage.header.count}
                pageType={activePage.type}
                showListIcon={activePage.header.showListIcon ?? false}
                title={activePage.header.title}
              />
            ) : null}
            {renderPage(activePage)}
          </IndexSurface>
        </ContentRow>
      </RightPane>
    </AppLayout>
  );

  if (mode === 'static') {
    return <ProductFrame>{appShell}</ProductFrame>;
  }
  return (
    <WindowOrderProvider>
      <AppWindow>{appShell}</AppWindow>
    </WindowOrderProvider>
  );
}
