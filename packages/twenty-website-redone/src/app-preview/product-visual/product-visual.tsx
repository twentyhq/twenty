'use client';

import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { mediaUp, spacing } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

import { AiPanel } from './ai-panel';
import { AiSteps } from './ai-steps';
import { ANTHROPIC_RECORD_PAGE } from './anthropic-record-page';
import { HERO_CURSORS } from './hero-cursors';
import { ProductHeroCursor } from './product-hero-cursor';
import { useProductHeroCursorAutoplay } from './use-product-hero-cursor-autoplay';
import { useProductVisualAutoplay } from './use-product-visual-autoplay';
import { APP_PREVIEW_CONFIG } from '../data/sidebar-config';
import { PreviewAppLayout } from '../shell/preview-app-layout';
import { ProductFrame } from '../stage/product-frame';

// How the window sits in its scene: a bleed mount keeps the full window
// width and runs off narrow viewports; a fluid mount reflows the board
// under the scene cap; a panel mount is the phone-width AI chat.
export type ProductVisualPresentation = 'bleed' | 'fluid' | 'panel';

const PANEL_ONLY_WIDTH_PX = 320;

const VisualRoot = styled.div<{ $fill: boolean }>`
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  flex: ${({ $fill }) => ($fill ? '1' : 'none')};
  flex-direction: column;
  isolation: isolate;
  margin-top: ${spacing(5)};
  min-height: 0;
  position: relative;
  text-align: left;
  width: 100%;

  ${mediaUp('md')} {
    margin-top: ${spacing(11)};
  }
`;

// The scene box owns the window geometry (single source — the frame
// just fills it).
const ShellScene = styled.div<{ $presentation: ProductVisualPresentation }>`
  flex: 0 0 auto;
  height: ${APP_PREVIEW_STAGE.windowScene.heightPx}px;
  margin: 0 auto;
  max-width: ${({ $presentation }) =>
    $presentation === 'panel'
      ? `${PANEL_ONLY_WIDTH_PX}px`
      : $presentation === 'fluid'
        ? `${APP_PREVIEW_STAGE.windowScene.widthPx}px`
        : 'none'};
  min-height: 0;
  position: relative;
  width: ${({ $presentation }) =>
    $presentation === 'bleed'
      ? `${APP_PREVIEW_STAGE.windowScene.widthPx}px`
      : '100%'};
`;

// The product mockup staged for the product hero: either one AI scene
// playing beside the Ask-AI panel, or (collaborative) three cursors
// touring the Anthropic record with the panel hidden.
export function ProductVisual({
  activeScene,
  collaborative = false,
  compactCursorTour = false,
  cursorActive = true,
  cursorLayer,
  fill = false,
  playbackEnabled = true,
  presentation = 'fluid',
}: {
  activeScene?: number;
  collaborative?: boolean;
  compactCursorTour?: boolean;
  cursorActive?: boolean;
  cursorLayer?: HTMLElement | null;
  fill?: boolean;
  playbackEnabled?: boolean;
  presentation?: ProductVisualPresentation;
}) {
  const {
    activeItem,
    activeItemId,
    activeStepIndex,
    agentSteps,
    completedStepCount,
    displayPage,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    selectPageItem,
    selectedScene,
    sidebarEntries,
    streamComplete,
    streamedTextVisibleLength,
    toggleFolder,
  } = useProductVisualAutoplay(APP_PREVIEW_CONFIG, {
    externalScene: activeScene,
    playbackEnabled,
  });

  const heroCursor = useProductHeroCursorAutoplay(
    collaborative && cursorActive,
    { mobile: compactCursorTour },
  );

  // The tour drives the page the collaborators look at.
  useEffect(() => {
    if (collaborative) {
      selectPageItem(heroCursor.pageItemId);
    }
  }, [collaborative, heroCursor.pageItemId, selectPageItem]);

  const effectivePage =
    collaborative && heroCursor.showRecord
      ? { ...ANTHROPIC_RECORD_PAGE, activeTabLabel: heroCursor.recordTab }
      : displayPage;
  const panelOnly = presentation === 'panel';
  const navbarLabel =
    effectivePage.type === 'record'
      ? effectivePage.header.title
      : activeItem.label;
  const compactWorkflowPage =
    effectivePage.type === 'workflow' && effectivePage.nodes === undefined;
  const desktopSidebarMode = collaborative
    ? 'collapsed'
    : (selectedScene.sidebarMode ?? 'collapsed');

  const rightAside = collaborative ? undefined : (
    <AiPanel
      activeStepIndex={activeStepIndex}
      completedStepCount={completedStepCount}
      panelOnly={panelOnly}
      scene={selectedScene}
      stepsSlot={
        agentSteps.length > 0 ? (
          <AiSteps
            activeStepIndex={activeStepIndex}
            answerStarted={streamedTextVisibleLength > 0}
            completedStepCount={completedStepCount}
            steps={agentSteps}
          />
        ) : null
      }
      streamComplete={streamComplete}
      streamedTextVisibleLength={streamedTextVisibleLength}
    />
  );

  const cursors =
    collaborative && cursorLayer
      ? createPortal(
          HERO_CURSORS.map((cursorConfig, index) => {
            const isActive = index === heroCursor.activeCursor;

            return (
              <ProductHeroCursor
                clicking={isActive && heroCursor.clicking}
                color={cursorConfig.color}
                glideMs={isActive ? heroCursor.glideMs : undefined}
                hidden={isActive && heroCursor.hidden}
                home={
                  compactCursorTour && cursorConfig.mobileHome
                    ? cursorConfig.mobileHome
                    : cursorConfig.home
                }
                key={cursorConfig.name}
                name={cursorConfig.name}
                target={isActive ? heroCursor.target : undefined}
              />
            );
          }),
          cursorLayer,
        )
      : null;

  return (
    <VisualRoot $fill={fill}>
      <ShellScene $presentation={presentation}>
        <ProductFrame compact={presentation !== 'bleed'} floatingShadow>
          <PreviewAppLayout
            activeItem={activeItem}
            activeItemId={activeItemId}
            compactWorkflowPage={compactWorkflowPage}
            desktopSidebarMode={desktopSidebarMode}
            favorites={APP_PREVIEW_CONFIG.sidebar.favorites}
            highlightedItemId={highlightedItemId}
            navbarActions={effectivePage.header.navbarActions}
            navbarLabel={navbarLabel}
            onSelectPageItem={selectPageItem}
            onToggleFolder={toggleFolder}
            openFolderIds={openFolderIds}
            page={effectivePage}
            panelOnly={panelOnly}
            revealedObjectIds={revealedObjectIds}
            rightAside={rightAside}
            workspaceEntries={sidebarEntries}
          />
        </ProductFrame>
      </ShellScene>
      {cursors}
    </VisualRoot>
  );
}
