'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

const POPUP_WIDTH = 321;

const Shell = styled.div<{ stackIndex: number }>`
  background-color: #c0c0c0;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #dfdfdf,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #ffffff;
  display: flex;
  flex-direction: column;
  left: ${({ stackIndex }) => 24 + stackIndex * 18}px;
  padding: 3px;
  position: absolute;
  top: ${({ stackIndex }) => 120 + stackIndex * 20}px;
  width: ${POPUP_WIDTH}px;
  z-index: ${({ stackIndex }) => 20 + stackIndex};
`;

const TitleBar = styled.div`
  align-items: center;
  background: linear-gradient(90deg, #c00000 0%, #b5b5b5 100%);
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleText = styled.p`
  color: ${theme.colors.secondary.background[100]};
  font-family: ${theme.font.family.mono};
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
  color: #c00000;
  flex-shrink: 0;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(8)};
  line-height: 1;
`;

const BodyText = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

export type WrongChoicePopupProps = {
  body: string;
  onClose: () => void;
  stackIndex: number;
  titleBar: string;
  titleId: string;
};

export function WrongChoicePopup({
  body,
  onClose,
  stackIndex,
  titleBar,
  titleId,
}: WrongChoicePopupProps) {
  return (
    <Shell
      aria-labelledby={titleId}
      role="dialog"
      stackIndex={stackIndex}
    >
      <TitleBar>
        <TitleText id={titleId}>{titleBar}</TitleText>
        <CloseButton
          aria-label="Close dialog"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </CloseButton>
      </TitleBar>
      <BodyRow>
        <IconMark aria-hidden="true">⊘</IconMark>
        <BodyText>{body}</BodyText>
      </BodyRow>
    </Shell>
  );
}
