'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { color, fontFamily, fontSize, spacing } from '@/tokens';
import { SALESFARCE_SCENE } from '@/tokens/feature-scenes/salesfarce-scene';

import { useTimedPopupDismissal } from './use-timed-popup-dismissal';
import { WRONG_CHOICE_POPUP } from './wrong-choice-popup-constants';

const Shell = styled.div`
  background-color: ${SALESFARCE_SCENE.popupBackground};
  box-shadow: ${SALESFARCE_SCENE.bevel.window};
  display: flex;
  flex-direction: column;
  padding: 3px;
  position: absolute;
  transition: opacity ${WRONG_CHOICE_POPUP.fadeDurationMs}ms ease-out;
  width: ${WRONG_CHOICE_POPUP.widthPx}px;
`;

const TitleBar = styled.div`
  align-items: center;
  background: ${SALESFARCE_SCENE.popupTitleBarGradient};
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleText = styled.p`
  color: ${color('white')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4)};
  line-height: 12px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  box-shadow: ${SALESFARCE_SCENE.bevel.raised};
  cursor: pointer;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(4)};
  line-height: 1;
  padding: 3px 4px 4px;
  position: relative;

  &:active {
    box-shadow: ${SALESFARCE_SCENE.bevel.pressed};
  }
`;

const BodyRow = styled.div`
  align-items: center;
  display: flex;
  column-gap: ${spacing(3)};
  padding: ${spacing(2.75)};
  width: 100%;
`;

const IconMark = styled.span`
  color: ${SALESFARCE_SCENE.popupIcon};
  flex-shrink: 0;
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(8)};
  line-height: 1;
`;

const BodyText = styled.p`
  color: ${color('black-80')};
  font-family: ${fontFamily('retro')};
  font-size: ${fontSize(5)};
  line-height: ${spacing(6)};
`;

type SalesfarceWrongChoicePopupProps = {
  body: MessageDescriptor;
  isClosingRequested?: boolean;
  layerIndex: number;
  left: number;
  onClose: () => void;
  titleBar: MessageDescriptor;
  titleId: string;
  top: number;
};

export function SalesfarceWrongChoicePopup({
  body,
  isClosingRequested = false,
  layerIndex,
  left,
  onClose,
  titleBar,
  titleId,
  top,
}: SalesfarceWrongChoicePopupProps) {
  const { i18n } = useLingui();
  const isClosing = useTimedPopupDismissal(isClosingRequested, onClose);

  return (
    <Shell
      aria-labelledby={titleId}
      role="dialog"
      style={{
        left,
        opacity: isClosing ? 0 : 1,
        pointerEvents: isClosing ? 'none' : 'auto',
        top,
        zIndex: 20 + layerIndex,
      }}
    >
      <TitleBar>
        <TitleText id={titleId}>{i18n._(titleBar)}</TitleText>
        <CloseButton
          aria-label={i18n._(msg`Close dialog`)}
          onClick={() => undefined}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </CloseButton>
      </TitleBar>
      <BodyRow>
        <IconMark aria-hidden="true">⊘</IconMark>
        <BodyText>{i18n._(body)}</BodyText>
      </BodyRow>
    </Shell>
  );
}
