'use client';

import { scheduleVisualMount } from '@/lib/visual-runtime';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import type { AppPreviewConfig } from './types';
import { AppWindow } from './AppWindow/AppWindow';
import { Terminal } from './Terminal/Terminal';
import { COLORS } from './Shared/utils/app-preview-theme';
import { AppPreviewNavbar } from './Shell/AppPreviewNavbar';
import { AppPreviewSidebar } from './Shell/AppPreviewSidebar';
import { AppPreviewViewbar } from './Shell/AppPreviewViewbar';
import { renderPageDefinition } from './Shell/PageRenderers';
import { preloadDeferredPages } from './Shell/preload-deferred-pages';
import { useAppPreviewState } from './Shell/use-app-preview-state';
import { WindowOrderProvider } from './WindowOrder/WindowOrderProvider';

const StyledAppPreview = styled.div`
  isolation: isolate;
  margin-top: ${theme.spacing(5)};
  position: relative;
  text-align: left;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(11)};
  }
`;

const ShellScene = styled.div`
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  max-height: 740px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    aspect-ratio: 1280 / 832;
  }
`;

const AppLayout = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  min-height: 0;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const RightPane = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  min-width: 0;
  padding: 12px 8px 12px 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-right: 12px;
  }
`;

const IndexSurface = styled.div`
  background: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

type AppPreviewProps = {
  showTerminal?: boolean;
  visual: AppPreviewConfig;
};

export function AppPreview({ showTerminal = true, visual }: AppPreviewProps) {
  const {
    activeItem,
    activeLabel,
    activePage,
    handleChatReset,
    handleJumpToConversationEnd,
    handleObjectCreated,
    handleSelectLabel,
    handleToggleFolder,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    workspaceNav,
  } = useAppPreviewState(visual);
  const activeHeader = activePage?.header;
  const showViewBar =
    activePage !== null &&
    activePage !== undefined &&
    activePage.type !== 'dashboard' &&
    activePage.type !== 'workflow';

  useEffect(
    () =>
      scheduleVisualMount(
        () => {
          void preloadDeferredPages();
        },
        { timeoutMs: 900 },
      ),
    [],
  );

  return (
    <StyledAppPreview>
      <ShellScene>
        <WindowOrderProvider>
          <AppWindow>
            <AppLayout>
              <AppPreviewSidebar
                favoritesNav={visual.favoritesNav}
                highlightedItemId={highlightedItemId ?? undefined}
                onSelectLabel={handleSelectLabel}
                onToggleFolder={handleToggleFolder}
                openFolderIds={openFolderIds}
                selectedLabel={activeLabel}
                workspaceName={visual.workspace.name}
                workspaceNav={workspaceNav}
              />

              <RightPane>
                <AppPreviewNavbar
                  activeItem={activeItem}
                  activeLabel={activeLabel}
                  navbarActions={activeHeader?.navbarActions}
                  revealedObjectIds={revealedObjectIds}
                />

                <IndexSurface>
                  {showViewBar ? (
                    <AppPreviewViewbar
                      actions={activeHeader?.actions ?? []}
                      count={activeHeader?.count}
                      pageType={activePage.type}
                      showListIcon={activeHeader?.showListIcon ?? false}
                      title={activeHeader?.title ?? activeLabel}
                    />
                  ) : null}

                  {activePage
                    ? renderPageDefinition(
                        activePage,
                        handleSelectLabel,
                        activeItem?.id ?? activeLabel,
                      )
                    : null}
                </IndexSurface>
              </RightPane>
            </AppLayout>
          </AppWindow>
          {showTerminal ? (
            <Terminal
              onObjectCreated={handleObjectCreated}
              onChatReset={handleChatReset}
              onJumpToConversationEnd={handleJumpToConversationEnd}
            />
          ) : null}
        </WindowOrderProvider>
      </ShellScene>
    </StyledAppPreview>
  );
}
