'use client';

import { styled } from '@linaria/react';

import type { AppPreviewConfig } from '@/sections/AppPreview';
import { COLORS } from '@/sections/AppPreview/Shared/utils/app-preview-theme';
import { VISUAL_TOKENS } from '@/sections/AppPreview/Shared/utils/app-preview-tokens';
import { AppPreviewNavbar } from '@/sections/AppPreview/Shell/AppPreviewNavbar';
import { AppPreviewSidebar } from '@/sections/AppPreview/Shell/AppPreviewSidebar';
import { AppPreviewViewbar } from '@/sections/AppPreview/Shell/AppPreviewViewbar';
import { renderPageDefinition } from '@/sections/AppPreview/Shell/PageRenderers';
import { AppWindow } from '@/sections/AppPreview/AppWindow/AppWindow';
import { WindowOrderProvider } from '@/sections/AppPreview/WindowOrder/WindowOrderProvider';
import { theme } from '@/theme';

import { PROMPT_OPTIONS } from './product-visual.data';
import { useProductVisualAutoplay } from './use-product-visual-autoplay';

const StyledRoot = styled.div`
  isolation: isolate;
  margin-top: ${theme.spacing(5)};
  position: relative;
  text-align: left;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(8)};
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
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const RightColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  min-width: 0;
  padding: 12px 12px 12px 0;
`;

const ContentRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  gap: 8px;
  min-height: 0;
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

  [aria-label*='workflow'] > div > div {
    left: 0;
    transform: scale(0.65) translateX(-20%);
    transform-origin: top left;
  }
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

  @media (max-width: ${theme.breakpoints.md}px) {
    display: none;
  }
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
  color: ${VISUAL_TOKENS.font.color.secondary};
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const AiPanelTitle = styled.span`
  color: ${VISUAL_TOKENS.font.color.primary};
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
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
  background: ${VISUAL_TOKENS.background.transparent.medium};
  border-radius: ${VISUAL_TOKENS.border.radius.sm};
  color: ${VISUAL_TOKENS.font.color.secondary};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4em;
  padding: 4px 8px;
  width: fit-content;
`;

const AiMsg = styled.div`
  color: ${VISUAL_TOKENS.font.color.primary};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4em;
  width: 100%;
`;

const ThinkingText = styled.span`
  color: ${VISUAL_TOKENS.font.color.tertiary};
  font-size: 13px;
`;

const PromptOption = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: ${VISUAL_TOKENS.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: 13px;
  gap: 8px;
  line-height: 1.4;
  padding: 6px 4px;
  text-align: left;
  width: 100%;

  &:hover {
    background: ${VISUAL_TOKENS.background.transparent.light};
  }
`;

const PromptOptionIcon = styled.span`
  align-items: center;
  color: ${VISUAL_TOKENS.font.color.secondary};
  display: flex;
  flex-shrink: 0;
`;

const PromptOptions = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 12px;
`;

const AiInputArea = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 8px;
  padding: 12px;
`;

const AiInputBox = styled.div`
  background-color: ${VISUAL_TOKENS.background.transparent.lighter};
  border: 1px solid ${VISUAL_TOKENS.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  padding: 12px;
  width: 100%;
`;

const AiInputPlaceholder = styled.span`
  color: ${VISUAL_TOKENS.font.color.light};
  font-size: 13px;
  font-weight: 400;
`;

const AiInputBtnRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: auto;
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
  border-radius: 6px;
  color: ${VISUAL_TOKENS.font.color.secondary};
  display: flex;
  font-size: 11px;
  gap: 4px;
  padding: 3px 8px;
`;

const SendBtn = styled.span`
  align-items: center;
  background: ${VISUAL_TOKENS.border.color.medium};
  border-radius: 50%;
  color: ${VISUAL_TOKENS.font.color.tertiary};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

type ProductVisualProps = {
  visual: AppPreviewConfig;
};

export function ProductVisual({ visual }: ProductVisualProps) {
  const {
    activeItem,
    activeLabel,
    displayPage,
    handleOptionSelect,
    handleSelectLabel,
    handleToggleFolder,
    highlightedItemId,
    openFolderIds,
    revealedObjectIds,
    selectedOption,
    streamComplete,
    streamedText,
    workspaceNav,
  } = useProductVisualAutoplay(visual);

  const activeHeader = displayPage?.header;
  const showViewBar =
    displayPage !== null &&
    displayPage !== undefined &&
    displayPage.type !== 'dashboard' &&
    displayPage.type !== 'workflow';

  return (
    <StyledRoot>
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

              <RightColumn>
                <AppPreviewNavbar
                  activeItem={activeItem}
                  activeLabel={activeLabel}
                  navbarActions={activeHeader?.navbarActions}
                  revealedObjectIds={revealedObjectIds}
                />

                <ContentRow>
                  <IndexSurface>
                    {showViewBar ? (
                      <AppPreviewViewbar
                        actions={activeHeader?.actions ?? []}
                        count={activeHeader?.count}
                        pageType={displayPage.type}
                        showListIcon={activeHeader?.showListIcon ?? false}
                        title={activeHeader?.title ?? activeLabel}
                      />
                    ) : null}

                    {displayPage
                      ? renderPageDefinition(
                          displayPage,
                          handleSelectLabel,
                          activeItem?.id ?? activeLabel,
                        )
                      : null}
                  </IndexSurface>

                  <AiPanel>
                    <AiPanelHeader>
                      <AiHeaderBtn>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </AiHeaderBtn>
                      <AiPanelTitle>Ask AI</AiPanelTitle>
                      <AiHeaderBtn>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </AiHeaderBtn>
                    </AiPanelHeader>
                    <AiMessages>
                      <UserMsg>{PROMPT_OPTIONS[selectedOption].label}</UserMsg>
                      {streamedText ? (
                        <AiMsg>{streamedText}</AiMsg>
                      ) : (
                        <ThinkingText>Thinking...</ThinkingText>
                      )}
                    </AiMessages>
                    {streamComplete ? (
                      <PromptOptions>
                        {PROMPT_OPTIONS.filter(
                          (_, index) => index !== selectedOption,
                        ).map((option, index) => (
                          <PromptOption
                            key={index}
                            onClick={() =>
                              handleOptionSelect(PROMPT_OPTIONS.indexOf(option))
                            }
                          >
                            <PromptOptionIcon>{option.icon}</PromptOptionIcon>
                            {option.label}
                          </PromptOption>
                        ))}
                      </PromptOptions>
                    ) : null}
                    <AiInputArea>
                      <AiInputBox>
                        <AiInputPlaceholder>
                          Ask, search or make anything...
                        </AiInputPlaceholder>
                        <AiInputBtnRow>
                          <AiInputLeftBtns>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
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
                              Claude Haiku 4.5
                              <svg
                                width="8"
                                height="8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </ModelChip>
                            <SendBtn>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                              </svg>
                            </SendBtn>
                          </AiInputRightBtns>
                        </AiInputBtnRow>
                      </AiInputBox>
                    </AiInputArea>
                  </AiPanel>
                </ContentRow>
              </RightColumn>
            </AppLayout>
          </AppWindow>
        </WindowOrderProvider>
      </ShellScene>
    </StyledRoot>
  );
}
