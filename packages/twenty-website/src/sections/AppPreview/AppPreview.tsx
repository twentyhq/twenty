'use client';

import { scheduleVisualMount } from '@/lib/visual-runtime';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import {
  AppPreviewFrame,
  type AppPreviewFrameMode,
} from './AppWindow/AppPreviewFrame';
import { AppPreviewLayout } from './Shell/AppPreviewLayout';
import { type DesktopSidebarMode } from './Shell/AppPreviewSidebar';
import { preloadDeferredPages } from './Shell/preload-deferred-pages';
import { useAppPreviewExperience } from './Shell/use-app-preview-experience';
import { Terminal } from './Terminal/Terminal';
import type { AppPreviewConfig } from './types';
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

type AppPreviewProps = {
  desktopSidebarMode?: DesktopSidebarMode;
  frameMode?: AppPreviewFrameMode;
  showTerminal?: boolean;
  visual: AppPreviewConfig;
};

export function AppPreview({
  desktopSidebarMode = 'expanded',
  frameMode,
  showTerminal = true,
  visual,
}: AppPreviewProps) {
  const {
    activeItem,
    activeItemId,
    activeItemLabel,
    activePage,
    favorites,
    handleChatReset,
    handleJumpToConversationEnd,
    handleObjectCreated,
    selectPageItem,
    toggleFolder,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    workspaceEntries,
  } = useAppPreviewExperience(visual);
  const resolvedFrameMode = frameMode ?? (showTerminal ? 'windowed' : 'static');
  const needsWindowOrder = showTerminal || resolvedFrameMode === 'windowed';

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

  const previewFrame = (
    <AppPreviewFrame mode={resolvedFrameMode}>
      <AppPreviewLayout
        activeItem={activeItem}
        activeItemId={activeItemId}
        activeItemLabel={activeItemLabel}
        desktopSidebarMode={desktopSidebarMode}
        favorites={favorites}
        highlightedItemId={highlightedItemId ?? undefined}
        onSelectPageItem={selectPageItem}
        onToggleFolder={toggleFolder}
        openFolderIds={openFolderIds}
        page={activePage}
        revealedObjectIds={revealedObjectIds}
        workspaceEntries={workspaceEntries}
      />
    </AppPreviewFrame>
  );

  const previewContent = (
    <>
      {previewFrame}
      {showTerminal ? (
        <Terminal
          onObjectCreated={handleObjectCreated}
          onChatReset={handleChatReset}
          onJumpToConversationEnd={handleJumpToConversationEnd}
        />
      ) : null}
    </>
  );

  return (
    <StyledAppPreview>
      <ShellScene>
        {needsWindowOrder ? (
          <WindowOrderProvider>{previewContent}</WindowOrderProvider>
        ) : (
          previewContent
        )}
      </ShellScene>
    </StyledAppPreview>
  );
}
