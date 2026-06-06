'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { styled } from '@linaria/react';
import {
  IconArrowUp,
  IconChevronDown,
  IconEdit,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import {
  AppPreviewFrame,
  type AppPreviewFrameMode,
} from '@/sections/AppPreview/AppWindow/AppPreviewFrame';
import { VISUAL_TOKENS } from '@/sections/AppPreview/Shared/utils/app-preview-tokens';
import { AppPreviewLayout } from '@/sections/AppPreview/Shell/AppPreviewLayout';
import { type DesktopSidebarMode } from '@/sections/AppPreview/Shell/AppPreviewSidebar';
import { WindowOrderProvider } from '@/sections/AppPreview/WindowOrder/WindowOrderProvider';
import { theme } from '@/theme';

import { HERO_CURSORS, ProductHeroCursor } from './ProductHeroCursor';
import { ProductVisualAiSteps } from './ProductVisualAiSteps';
import { ANTHROPIC_RECORD_PAGE } from './product-visual.data';
import { useProductHeroCursorAutoplay } from './use-product-hero-cursor-autoplay';
import { useProductVisualAutoplay } from './use-product-visual-autoplay';

const MAX_VISIBLE_RESPONSE_CHIPS = 3;

const StyledRoot = styled.div<{ $fill: boolean }>`
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  flex: ${({ $fill }) => ($fill ? '1' : 'none')};
  flex-direction: column;
  isolation: isolate;
  margin-top: ${theme.spacing(5)};
  min-height: 0;
  position: relative;
  text-align: left;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(11)};
  }
`;

const WINDOW_MAX_WIDTH = 1040;
const WINDOW_HEIGHT = 676;

// bleed: fixed-width window that runs off the right edge when the viewport is
// narrower than it. compact: same fixed height (no aspect scaling) but the width
// fits the viewport (capped), so the board flexes while the sidebar + AI panel
// stay legible — used by the morph so the AI panel never bleeds off-screen.
const ShellScene = styled.div<{
  $fill: boolean;
  $bleed: boolean;
  $compact: boolean;
}>`
  aspect-ratio: ${({ $fill, $bleed, $compact }) =>
    $fill || $bleed || $compact ? 'auto' : '1280 / 832'};
  flex: ${({ $fill, $bleed, $compact }) =>
    $fill && !$bleed && !$compact ? '1' : '0 0 auto'};
  height: ${({ $bleed, $compact }) =>
    $bleed || $compact ? `${WINDOW_HEIGHT}px` : 'auto'};
  margin: 0 auto;
  max-height: ${({ $fill, $bleed, $compact }) =>
    $fill || $bleed || $compact ? 'none' : '740px'};
  max-width: ${({ $compact }) => ($compact ? `${WINDOW_MAX_WIDTH}px` : 'none')};
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: ${({ $bleed }) => ($bleed ? `${WINDOW_MAX_WIDTH}px` : '100%')};
`;

const AiPanel = styled.aside`
  background: ${VISUAL_TOKENS.background.primary};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: 280px;
`;

const AiPanelHeader = styled.div`
  align-items: center;
  background-color: ${VISUAL_TOKENS.background.secondary};
  border-bottom: 1px solid ${VISUAL_TOKENS.border.color.medium};
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  height: 40px;
  padding: 0 8px;
`;

const AiHeaderBtn = styled.span`
  align-items: center;
  border-radius: 4px;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const AiPanelTitle = styled.span`
  color: ${VISUAL_TOKENS.font.color.primary};
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
`;

const AiMessages = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 12px;
`;

const UserMsg = styled.div`
  align-self: flex-end;
  background: #f1f1f1;
  border-radius: 4px;
  color: ${VISUAL_TOKENS.font.color.secondary};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  padding: 4px 8px;
  width: fit-content;
`;

const AiMsg = styled.div`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  width: 100%;
`;

const AiMsgStrong = styled.strong`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-weight: 500;
`;

const AiMsgParagraph = styled.div`
  line-height: inherit;
  margin-block: 8px;

  &:first-child {
    margin-block-start: 0;
  }

  &:last-child {
    margin-block-end: 0;
  }
`;

const EntityChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const EntityChip = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  display: flex;
  gap: 4px;
  max-width: 100%;
  padding: 3px 6px;
  width: fit-content;
`;

const EntityChipIcon = styled.img`
  border-radius: 2px;
  height: 14px;
  object-fit: cover;
  width: 14px;
`;

const EntityChipName = styled.span`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
`;

const EntityOverflowChip = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  color: ${VISUAL_TOKENS.font.color.secondary};
  display: flex;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  padding: 3px 6px;
`;

const ThinkingText = styled.span`
  color: ${VISUAL_TOKENS.font.color.tertiary};
  font-size: 12px;
  font-weight: 500;
`;

const AiInputArea = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 12px;
`;

const AiInputBox = styled.div`
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: 80px;
  justify-content: space-between;
  min-height: 32px;
  padding: 8px;
  width: 100%;
`;

const AiInputPlaceholder = styled.span`
  color: ${VISUAL_TOKENS.font.color.light};
  font-size: 13px;
  font-weight: 400;
  padding: 4px 0;
`;

const AiInputBtnRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const AiInputLeftBtns = styled.div`
  align-items: center;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  gap: 2px;
`;

const AiInputRightBtns = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const ModelChip = styled.span`
  align-items: center;
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 4px;
  color: ${VISUAL_TOKENS.font.color.primary};
  display: flex;
  font-size: 12px;
  gap: 4px;
  padding: 4px 8px;
`;

const ModelChipChevron = styled.span`
  align-items: center;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
`;

const SendBtn = styled.span`
  align-items: center;
  background: ${VISUAL_TOKENS.border.color.medium};
  border-radius: 50%;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

type ProductVisualProps = {
  activeScene?: number;
  aiPanelProgress?: number;
  bleed?: boolean;
  collaborative?: boolean;
  compact?: boolean;
  cursorActive?: boolean;
  cursorLayer?: HTMLElement | null;
  desktopSidebarMode?: DesktopSidebarMode;
  fill?: boolean;
  frameMode?: AppPreviewFrameMode;
  playbackEnabled?: boolean;
  visual: AppPreviewConfig;
};

function renderParagraphInline(
  text: string,
  visibleLength: number,
  keyPrefix: string,
) {
  const parts: ReactNode[] = [];
  let visibleRemaining = visibleLength;
  let cursor = 0;
  let partIndex = 0;

  while (cursor < text.length && visibleRemaining > 0) {
    const openIndex = text.indexOf('**', cursor);

    if (openIndex === -1) {
      const segment = text.slice(cursor, cursor + visibleRemaining);
      parts.push(segment);
      visibleRemaining -= segment.length;
      break;
    }

    if (openIndex > cursor) {
      const plainSegment = text.slice(cursor, openIndex);
      const visiblePlainSegment = plainSegment.slice(0, visibleRemaining);

      if (visiblePlainSegment.length > 0) {
        parts.push(visiblePlainSegment);
        visibleRemaining -= visiblePlainSegment.length;
      }

      if (visiblePlainSegment.length < plainSegment.length) {
        break;
      }
    }

    const closeIndex = text.indexOf('**', openIndex + 2);

    if (closeIndex === -1) {
      const trailingSegment = text.slice(
        openIndex + 2,
        openIndex + 2 + visibleRemaining,
      );

      if (trailingSegment.length > 0) {
        parts.push(
          <AiMsgStrong key={`${keyPrefix}-strong-${partIndex}`}>
            {trailingSegment}
          </AiMsgStrong>,
        );
        visibleRemaining -= trailingSegment.length;
      }

      break;
    }

    const boldSegment = text.slice(openIndex + 2, closeIndex);
    const visibleBoldSegment = boldSegment.slice(0, visibleRemaining);

    parts.push(
      <AiMsgStrong key={`${keyPrefix}-strong-${partIndex}`}>
        {visibleBoldSegment}
      </AiMsgStrong>,
    );
    partIndex += 1;
    visibleRemaining -= visibleBoldSegment.length;

    if (visibleBoldSegment.length < boldSegment.length) {
      break;
    }

    cursor = closeIndex + 2;
  }

  return { nodes: parts, consumed: visibleLength - visibleRemaining };
}

function renderAssistantText(paragraphs: string[], visibleLength: number) {
  const blocks: ReactNode[] = [];
  let visibleRemaining = visibleLength;

  for (let index = 0; index < paragraphs.length; index += 1) {
    if (visibleRemaining <= 0) {
      break;
    }

    const { nodes, consumed } = renderParagraphInline(
      paragraphs[index],
      visibleRemaining,
      `p-${index}`,
    );

    if (nodes.length > 0) {
      blocks.push(<AiMsgParagraph key={`p-${index}`}>{nodes}</AiMsgParagraph>);
    }

    visibleRemaining -= consumed;
  }

  return blocks;
}

export function ProductVisual({
  activeScene,
  aiPanelProgress = 1,
  bleed = false,
  collaborative = false,
  compact = false,
  cursorActive = true,
  cursorLayer,
  desktopSidebarMode = 'expanded',
  fill = false,
  frameMode = 'static',
  playbackEnabled = true,
  visual,
}: ProductVisualProps) {
  const {
    activeItem,
    activeItemId,
    activeItemLabel,
    activeStepIndex,
    agentSteps,
    completedStepCount,
    displayPage,
    favorites,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    selectPageItem,
    selectedScene,
    streamComplete,
    streamedTextVisibleLength,
    toggleFolder,
    workspaceEntries,
  } = useProductVisualAutoplay(visual, {
    externalScene: activeScene,
    playbackEnabled,
  });

  const aiMessagesRef = useRef<HTMLDivElement>(null);

  // Keep the latest agent step / streamed text in view, like a real chat.
  useEffect(() => {
    const messages = aiMessagesRef.current;

    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }, [activeStepIndex, completedStepCount, streamedTextVisibleLength]);

  const heroCursor = useProductHeroCursorAutoplay(
    collaborative && cursorActive,
  );

  useEffect(() => {
    if (collaborative) {
      selectPageItem(heroCursor.pageItemId);
    }
  }, [collaborative, heroCursor.pageItemId, selectPageItem]);

  const effectivePage =
    collaborative && heroCursor.showRecord
      ? { ...ANTHROPIC_RECORD_PAGE, activeTabLabel: heroCursor.recordTab }
      : displayPage;
  const navbarLabel =
    effectivePage.type === 'record'
      ? effectivePage.header.title
      : activeItemLabel;
  const responseChips = selectedScene.responseChips;
  const compactWorkflowPage =
    effectivePage.type === 'workflow' && effectivePage.nodes === undefined;
  const resolvedDesktopSidebarMode = collaborative
    ? 'collapsed'
    : activeScene !== undefined && activeScene > 0
      ? (selectedScene.sidebarMode ?? 'collapsed')
      : desktopSidebarMode;
  const visibleResponseChips = responseChips.slice(
    0,
    MAX_VISIBLE_RESPONSE_CHIPS,
  );
  const hiddenResponseChipCount = Math.max(
    responseChips.length - MAX_VISIBLE_RESPONSE_CHIPS,
    0,
  );

  const previewShell = (
    <AppPreviewFrame compact={compact} fill={fill} mode={frameMode}>
      <AppPreviewLayout
        activeItem={activeItem}
        activeItemId={activeItemId}
        activeItemLabel={activeItemLabel}
        asideProgress={aiPanelProgress}
        compactWorkflowPage={compactWorkflowPage}
        desktopSidebarMode={resolvedDesktopSidebarMode}
        favorites={favorites}
        highlightedItemId={highlightedItemId ?? undefined}
        navbarLabel={navbarLabel}
        onSelectPageItem={selectPageItem}
        onToggleFolder={toggleFolder}
        openFolderIds={openFolderIds}
        page={effectivePage}
        revealedObjectIds={revealedObjectIds}
        rightAside={
          collaborative ? undefined : (
            <AiPanel>
              <AiPanelHeader>
                <AiHeaderBtn>
                  <IconX size={13} stroke={2} />
                </AiHeaderBtn>
                <AiPanelTitle>Ask AI</AiPanelTitle>
                <AiHeaderBtn>
                  <IconEdit size={13} stroke={2} />
                </AiHeaderBtn>
              </AiPanelHeader>
              <AiMessages ref={aiMessagesRef}>
                <UserMsg>{selectedScene.label}</UserMsg>
                {agentSteps.length > 0 ? (
                  <ProductVisualAiSteps
                    activeStepIndex={activeStepIndex}
                    answerStarted={streamedTextVisibleLength > 0}
                    completedStepCount={completedStepCount}
                    steps={agentSteps}
                  />
                ) : null}
                {streamedTextVisibleLength > 0 ? (
                  <>
                    <AiMsg>
                      {renderAssistantText(
                        selectedScene.responseText,
                        streamedTextVisibleLength,
                      )}
                    </AiMsg>
                    {streamComplete && responseChips.length > 0 ? (
                      <EntityChips>
                        {visibleResponseChips.map((chip) => (
                          <EntityChip key={chip.name}>
                            <EntityChipIcon
                              src={chip.logoUrl}
                              alt={chip.name}
                            />
                            <EntityChipName>{chip.name}</EntityChipName>
                          </EntityChip>
                        ))}
                        {hiddenResponseChipCount > 0 ? (
                          <EntityOverflowChip>
                            +{hiddenResponseChipCount} more
                          </EntityOverflowChip>
                        ) : null}
                      </EntityChips>
                    ) : null}
                  </>
                ) : agentSteps.length === 0 ? (
                  <ThinkingText>Thinking...</ThinkingText>
                ) : null}
              </AiMessages>
              <AiInputArea>
                <AiInputBox>
                  <AiInputPlaceholder>
                    Ask, search or make anything...
                  </AiInputPlaceholder>
                  <AiInputBtnRow>
                    <AiInputLeftBtns>
                      <IconPaperclip size={13} stroke={2} />
                    </AiInputLeftBtns>
                    <AiInputRightBtns>
                      <ModelChip>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="#D97757"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
                            fillRule="nonzero"
                          />
                        </svg>
                        Claude Opus 4.6
                        <ModelChipChevron>
                          <IconChevronDown size={13} stroke={2} />
                        </ModelChipChevron>
                      </ModelChip>
                      <SendBtn>
                        <IconArrowUp size={13} stroke={2} />
                      </SendBtn>
                    </AiInputRightBtns>
                  </AiInputBtnRow>
                </AiInputBox>
              </AiInputArea>
            </AiPanel>
          )
        }
        workspaceEntries={workspaceEntries}
      />
    </AppPreviewFrame>
  );

  const cursors =
    collaborative && cursorLayer
      ? createPortal(
          HERO_CURSORS.map((cursorConfig, index) => {
            const isActive = index === heroCursor.activeCursor;

            return (
              <ProductHeroCursor
                key={cursorConfig.name}
                clicking={isActive && heroCursor.clicking}
                color={cursorConfig.color}
                glideMs={isActive ? heroCursor.glideMs : undefined}
                hidden={isActive && heroCursor.hidden}
                home={cursorConfig.home}
                name={cursorConfig.name}
                target={isActive ? heroCursor.target : undefined}
              />
            );
          }),
          cursorLayer,
        )
      : null;

  return (
    <StyledRoot $fill={fill}>
      <ShellScene $bleed={bleed} $compact={compact} $fill={fill}>
        {frameMode === 'windowed' ? (
          <WindowOrderProvider>{previewShell}</WindowOrderProvider>
        ) : (
          previewShell
        )}
      </ShellScene>
      {cursors}
    </StyledRoot>
  );
}
