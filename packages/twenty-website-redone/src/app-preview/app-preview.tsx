'use client';

import { useEffect } from 'react';

import { scheduleIdleTask } from '@/platform/motion';



import { APP_PREVIEW_CONFIG } from './data/sidebar-config';
import { PreviewAppLayout } from './shell/preview-app-layout';
import { useAppPreviewExperience } from './shell/use-app-preview-experience';
import { AppWindow } from './stage/app-window';
import { ProductFrame } from './stage/product-frame';
import { WindowOrderProvider } from './stage/window-order-provider';
import { Terminal } from './terminal/terminal';

// The product mockup: navigable sidebar + the object pages, presented
// as a draggable/resizable desktop window (the old hero's identity), with
// the AI Terminal floating beside it. The chat's object-creation beats
// drive the sidebar reveals and page jumps.
export function AppPreview({
  mode = 'windowed',
}: {
  mode?: 'static' | 'windowed';
}) {
  useEffect(
    () =>
      scheduleIdleTask(() => {
        void import('./pages/dashboard/dashboard-page');
      }),
    [],
  );
  const experience = useAppPreviewExperience(APP_PREVIEW_CONFIG);
  const {
    activeItem,
    activeItemId,
    activePage,
    handleChatReset,
    handleJumpToConversationEnd,
    handleObjectCreated,
    highlightedItemId,
    revealedObjectIds,
    sidebarEntries,
  } = experience;
  const appShell = (
    <PreviewAppLayout
      activeItem={activeItem}
      activeItemId={activeItemId}
      favorites={APP_PREVIEW_CONFIG.sidebar.favorites}
      highlightedItemId={highlightedItemId}
      navbarActions={activePage.header.navbarActions}
      navbarLabel={activeItem.label}
      onSelectPageItem={experience.selectPageItem}
      onToggleFolder={experience.toggleFolder}
      openFolderIds={experience.openFolderIds}
      page={activePage}
      revealedObjectIds={revealedObjectIds}
      workspaceEntries={sidebarEntries}
    />
  );

  if (mode === 'static') {
    return <ProductFrame>{appShell}</ProductFrame>;
  }
  return (
    <WindowOrderProvider>
      <AppWindow>{appShell}</AppWindow>
      <Terminal
        onChatReset={handleChatReset}
        onJumpToConversationEnd={handleJumpToConversationEnd}
        onObjectCreated={handleObjectCreated}
      />
    </WindowOrderProvider>
  );
}
