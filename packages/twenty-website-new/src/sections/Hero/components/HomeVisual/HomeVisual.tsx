'use client';

import { scheduleVisualMount } from '@/lib/visual-runtime';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import type { HeroVisualType } from '@/sections/Hero/types';
import { DraggableAppWindow } from './DraggableAppWindow/DraggableAppWindow';
import { DraggableTerminal } from './DraggableTerminal/DraggableTerminal';
import { COLORS } from './Shared/utils/home-visual-theme';
import { HomeVisualNavbar } from './Shell/HomeVisualNavbar';
import { HomeVisualSidebar } from './Shell/HomeVisualSidebar';
import { HomeVisualViewbar } from './Shell/HomeVisualViewbar';
import { renderPageDefinition } from './Shell/HomeVisualPageRenderers';
import { preloadDeferredHomeVisualPages } from './Shell/preload-deferred-home-visual-pages';
import { useHomeVisualState } from './Shell/use-home-visual-state';
import { WindowOrderProvider } from './WindowOrder/WindowOrderProvider';

const StyledHomeVisual = styled.div`
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

export function HomeVisual({ visual }: { visual: HeroVisualType }) {
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
  } = useHomeVisualState(visual);
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
          void preloadDeferredHomeVisualPages();
        },
        { timeoutMs: 900 },
      ),
    [],
  );

  return (
    <StyledHomeVisual>
      <ShellScene>
        <WindowOrderProvider>
          <DraggableAppWindow>
            <AppLayout>
              <HomeVisualSidebar
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
                <HomeVisualNavbar
                  activeItem={activeItem}
                  activeLabel={activeLabel}
                  navbarActions={activeHeader?.navbarActions}
                  revealedObjectIds={revealedObjectIds}
                />

                <IndexSurface>
                  {showViewBar ? (
                    <HomeVisualViewbar
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
          </DraggableAppWindow>
          <DraggableTerminal
            onObjectCreated={handleObjectCreated}
            onChatReset={handleChatReset}
            onJumpToConversationEnd={handleJumpToConversationEnd}
          />
        </WindowOrderProvider>
      </ShellScene>
    </StyledHomeVisual>
  );
}
