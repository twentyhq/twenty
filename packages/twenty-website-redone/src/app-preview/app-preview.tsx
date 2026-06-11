'use client';

import { styled } from '@linaria/react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { APP_PREVIEW_CONFIG } from './data/sidebar-config';
import { KanbanPage } from './pages/kanban/kanban-page';
import { TablePage } from './pages/table/table-page';
import { PREVIEW_COLORS } from './preview-colors';
import { PreviewNavbar } from './shell/preview-navbar';
import { PreviewSidebar } from './shell/preview-sidebar';
import { PreviewViewbar } from './shell/preview-viewbar';
import { useAppPreviewNavigation } from './shell/use-app-preview-navigation';
import { ProductFrame } from './stage/product-frame';
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
    // Record/dashboard/workflow land with commits 4b-5.
    default:
      return null;
  }
}

// The product mockup: navigable sidebar + the object pages. The AI
// scenario and windowed drag arrive with commits 6-8 of the wave.
export function AppPreview() {
  const { sidebar, defaultViewbarActions } = APP_PREVIEW_CONFIG;
  const navigation = useAppPreviewNavigation(APP_PREVIEW_CONFIG);
  const { activeItem, activeItemId, activePage } = navigation;
  const showViewbar =
    activePage.type !== 'record' && activePage.type !== 'workflow';

  return (
    <ProductFrame>
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
    </ProductFrame>
  );
}
