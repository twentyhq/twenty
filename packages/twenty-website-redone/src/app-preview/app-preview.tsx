import { styled } from '@linaria/react';

import { mediaUp } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { APP_PREVIEW_CONFIG } from './data/sidebar-config';
import { TablePage } from './pages/table/table-page';
import { PREVIEW_COLORS } from './preview-colors';
import { PreviewNavbar } from './shell/preview-navbar';
import { PreviewSidebar } from './shell/preview-sidebar';
import { PreviewViewbar } from './shell/preview-viewbar';
import { ProductFrame } from './stage/product-frame';
import { isSidebarFolder } from './shell/is-sidebar-folder';
import { type SidebarItemDef } from './types';

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

// The static product mockup: the Companies view inside the framed app
// shell. Navigation, the remaining pages, and the AI scenario arrive with
// commits 4-8 of the wave.
export function AppPreview() {
  const { sidebar, defaultViewbarActions } = APP_PREVIEW_CONFIG;
  const activeItem = sidebar.workspace
    .filter((entry): entry is SidebarItemDef => !isSidebarFolder(entry))
    .find((entry) => entry.id === sidebar.initialActiveItemId);
  const page = activeItem?.page;

  if (!activeItem || page?.type !== 'table') {
    return null;
  }

  return (
    <ProductFrame>
      <AppLayout>
        <PreviewSidebar
          favorites={sidebar.favorites}
          selectedItemId={sidebar.initialActiveItemId}
          workspace={sidebar.workspace}
        />
        <RightPane>
          <PreviewNavbar
            activeItem={activeItem}
            activeItemLabel={activeItem.label}
          />
          <ContentRow>
            <IndexSurface>
              <PreviewViewbar
                actions={page.header.actions ?? defaultViewbarActions}
                count={page.header.count}
                pageType={page.type}
                showListIcon={page.header.showListIcon ?? false}
                title={page.header.title}
              />
              <TablePage page={page} />
            </IndexSurface>
          </ContentRow>
        </RightPane>
      </AppLayout>
    </ProductFrame>
  );
}
