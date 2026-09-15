'use client';

import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import {
  IconArrowUp,
  IconChevronDown,
  IconEdit,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';
import { Fragment, useEffect, useRef, type ReactNode } from 'react';

import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { ClaudeMark } from '@/icons';
import { streamedMarkdown } from './streamed-markdown';
import { type ProductVisualSceneDefinition } from './product-visual-scenes';

const MAX_VISIBLE_RESPONSE_CHIPS = 3;

const inks = APP_PREVIEW_TONES.productVisual;

const PanelShell = styled.aside<{ $panelOnly: boolean }>`
  background: ${THEME_LIGHT.background.primary};
  border: ${({ $panelOnly }) =>
    $panelOnly ? 'none' : `1px solid ${THEME_LIGHT.border.color.medium}`};
  border-radius: ${({ $panelOnly }) => ($panelOnly ? '0' : '8px')};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: ${({ $panelOnly }) => ($panelOnly ? '100%' : '280px')};
`;

const PanelHeader = styled.div`
  align-items: center;
  background-color: ${THEME_LIGHT.background.secondary};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.medium};
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  height: 40px;
  padding: 0 8px;
`;

const HeaderButton = styled.span`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const PanelTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  flex: 1;
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
`;

const Messages = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 12px;
`;

const UserMessage = styled.div`
  align-self: flex-end;
  background: ${inks.userMessageBackground};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  padding: 4px 8px;
  width: fit-content;
`;

const AnswerText = styled.div`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  width: 100%;
`;

const AnswerStrong = styled.strong`
  color: ${THEME_LIGHT.font.color.primary};
  font-weight: 500;
`;

const AnswerParagraph = styled.div`
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
  background: ${inks.entityChipBackground};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  display: flex;
  gap: 4px;
  max-width: 100%;
  padding: 3px 6px;
  width: fit-content;
`;

const EntityChipIcon = styled.img`
  border-radius: ${THEME_LIGHT.border.radius.xs};
  height: 14px;
  object-fit: cover;
  width: 14px;
`;

const EntityChipName = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
`;

const EntityOverflowChip = styled.div`
  align-items: center;
  background: ${inks.entityChipBackground};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  padding: 3px 6px;
`;

const ThinkingText = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 12px;
`;

const InputBox = styled.div`
  background-color: ${inks.inputBoxBackground};
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  display: flex;
  flex-direction: column;
  height: 80px;
  justify-content: space-between;
  min-height: 32px;
  padding: 8px;
  width: 100%;
`;

const InputPlaceholder = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-family: var(--font-product), sans-serif;
  font-size: 13px;
  font-weight: 400;
  padding: 4px 0;
`;

const InputButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const InputLeftButtons = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  gap: 2px;
`;

const InputRightButtons = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const ModelChip = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  gap: 4px;
  padding: 4px 8px;
`;

const ModelChipChevron = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
`;

const SendButton = styled.span`
  align-items: center;
  background: ${THEME_LIGHT.border.color.medium};
  border-radius: 50%;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

// The Ask-AI side panel: the user's prompt, the agent's steps (slotted in
// by the playback layer), the streamed answer with entity chips, and the
// composer chrome. Mock copy is product-screenshot fiction (English).
export function AiPanel({
  activeStepIndex = -1,
  completedStepCount = 0,
  panelOnly = false,
  scene,
  stepsSlot = null,
  streamComplete = false,
  streamedTextVisibleLength = 0,
}: {
  activeStepIndex?: number;
  completedStepCount?: number;
  panelOnly?: boolean;
  scene: ProductVisualSceneDefinition;
  stepsSlot?: ReactNode;
  streamComplete?: boolean;
  streamedTextVisibleLength?: number;
}) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const hasSteps = (scene.steps?.length ?? 0) > 0;
  const responseChips = scene.responseChips;
  const visibleResponseChips = responseChips.slice(
    0,
    MAX_VISIBLE_RESPONSE_CHIPS,
  );
  const hiddenResponseChipCount = Math.max(
    responseChips.length - MAX_VISIBLE_RESPONSE_CHIPS,
    0,
  );
  // A streamed answer's runs have positional identity; bind the numbers
  // ahead of render so keys are explicit data.
  const revealedParagraphs = streamedMarkdown
    .sliceVisibleParagraphs(scene.responseText, streamedTextVisibleLength)
    .map((segments, paragraphNumber) => ({
      number: paragraphNumber,
      segments: segments.map((segment, segmentNumber) => ({
        bold: segment.bold,
        number: segmentNumber,
        text: segment.text,
      })),
    }));

  // Keep the latest agent step / streamed text in view, like a real chat.
  useEffect(() => {
    const messages = messagesRef.current;

    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }, [activeStepIndex, completedStepCount, streamedTextVisibleLength]);

  return (
    <PanelShell $panelOnly={panelOnly}>
      <PanelHeader>
        <HeaderButton>
          <IconX size={13} stroke={2} />
        </HeaderButton>
        <PanelTitle>Ask AI</PanelTitle>
        <HeaderButton>
          <IconEdit size={13} stroke={2} />
        </HeaderButton>
      </PanelHeader>
      <Messages ref={messagesRef}>
        <UserMessage>{scene.label}</UserMessage>
        {stepsSlot}
        {streamedTextVisibleLength > 0 ? (
          <>
            <AnswerText>
              {revealedParagraphs.map((paragraph) => (
                <AnswerParagraph key={paragraph.number}>
                  {paragraph.segments.map((segment) =>
                    segment.bold ? (
                      <AnswerStrong key={segment.number}>
                        {segment.text}
                      </AnswerStrong>
                    ) : (
                      <Fragment key={segment.number}>{segment.text}</Fragment>
                    ),
                  )}
                </AnswerParagraph>
              ))}
            </AnswerText>
            {streamComplete && responseChips.length > 0 ? (
              <EntityChips>
                {visibleResponseChips.map((chip) => (
                  <EntityChip key={chip.name}>
                    <EntityChipIcon
                      alt={chip.name}
                      fetchPriority="low"
                      src={chip.logoUrl}
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
        ) : hasSteps ? null : (
          <ThinkingText>Thinking...</ThinkingText>
        )}
      </Messages>
      <InputArea>
        <InputBox>
          <InputPlaceholder>Ask, search or make anything...</InputPlaceholder>
          <InputButtonRow>
            <InputLeftButtons>
              <IconPaperclip size={13} stroke={2} />
            </InputLeftButtons>
            <InputRightButtons>
              <ModelChip>
                <ClaudeMark sizePx={12} />
                Claude Opus 4.6
                <ModelChipChevron>
                  <IconChevronDown size={13} stroke={2} />
                </ModelChipChevron>
              </ModelChip>
              <SendButton>
                <IconArrowUp size={13} stroke={2} />
              </SendButton>
            </InputRightButtons>
          </InputButtonRow>
        </InputBox>
      </InputArea>
    </PanelShell>
  );
}
