'use client';

import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { useTimeoutRegistry } from '@/lib/react';
import type { MessageDescriptor } from '@lingui/core';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';

export const WRONG_CHOICE_POPUP_WIDTH = 321;
const POPUP_VISIBLE_DURATION_MS = 3000;
const POPUP_FADE_DURATION_MS = 240;

const Shell = styled.div<{
  isClosing: boolean;
  layerIndex: number;
  left: number;
  top: number;
}>`
  background-color: #c0c0c0;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #dfdfdf,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #ffffff;
  display: flex;
  flex-direction: column;
  left: ${({ left }) => left}px;
  opacity: ${({ isClosing }) => (isClosing ? 0 : 1)};
  padding: 3px;
  pointer-events: ${({ isClosing }) => (isClosing ? 'none' : 'auto')};
  position: absolute;
  top: ${({ top }) => top}px;
  transition: opacity ${POPUP_FADE_DURATION_MS}ms ease-out;
  width: ${WRONG_CHOICE_POPUP_WIDTH}px;
  z-index: ${({ layerIndex }) => 20 + layerIndex};
`;

const TitleBar = styled.div`
  align-items: center;
  background: linear-gradient(90deg, #008000 0%, #b5b5b5 100%);
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleText = styled.p`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  line-height: 12px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  cursor: pointer;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  line-height: 1;
  padding: 3px 4px 4px;
  position: relative;

  &:active {
    box-shadow:
      inset 1px 1px 0 0 #0a0a0a,
      inset -1px -1px 0 0 #ffffff;
  }
`;

const BodyRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(2.75)};
  width: 100%;
`;

const IconMark = styled.span`
  color: #008000;
  flex-shrink: 0;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(8)};
  line-height: 1;
`;

const BodyText = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

export type WrongChoicePopupProps = {
  body: MessageDescriptor;
  isClosingRequested?: boolean;
  layerIndex: number;
  left: number;
  onClose: () => void;
  top: number;
  titleBar: MessageDescriptor;
  titleId: string;
};

export function WrongChoicePopup({
  body,
  isClosingRequested = false,
  layerIndex,
  left,
  onClose,
  top,
  titleBar,
  titleId,
}: WrongChoicePopupProps) {
  const renderText = useRenderMessage();
  const timeoutRegistry = useTimeoutRegistry();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    return timeoutRegistry.schedule(() => {
      setIsClosing(true);
    }, POPUP_VISIBLE_DURATION_MS);
  }, [timeoutRegistry]);

  useEffect(() => {
    if (isClosingRequested) {
      setIsClosing(true);
    }
  }, [isClosingRequested]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    return timeoutRegistry.schedule(() => {
      onClose();
    }, POPUP_FADE_DURATION_MS);
  }, [isClosing, onClose, timeoutRegistry]);

  return (
    <Shell
      aria-labelledby={titleId}
      isClosing={isClosing}
      layerIndex={layerIndex}
      left={left}
      role="dialog"
      top={top}
    >
      <TitleBar>
        <TitleText id={titleId}>{renderText(titleBar)}</TitleText>
        <CloseButton
          aria-label="Close dialog"
          onClick={() => undefined}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </CloseButton>
      </TitleBar>
      <BodyRow>
        <IconMark aria-hidden="true">⊘</IconMark>
        <BodyText>{renderText(body)}</BodyText>
      </BodyRow>
    </Shell>
  );
}
