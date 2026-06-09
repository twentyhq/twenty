'use client';

import { styled } from '@linaria/react';

import {
  BG_DARK,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_TERTIARY,
} from './visual-tokens';

const Root = styled.div`
  background: ${BG_DARK};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  padding: 16px;
  width: 100%;
`;

const DropZone = styled.div`
  align-items: center;
  background:
    repeating-linear-gradient(
      0deg,
      ${CARD_TEXT},
      ${CARD_TEXT} 10px,
      transparent 10px,
      transparent 20px,
      ${CARD_TEXT} 20px
    ),
    repeating-linear-gradient(
      90deg,
      ${CARD_TEXT},
      ${CARD_TEXT} 10px,
      transparent 10px,
      transparent 20px,
      ${CARD_TEXT} 20px
    ),
    repeating-linear-gradient(
      180deg,
      ${CARD_TEXT},
      ${CARD_TEXT} 10px,
      transparent 10px,
      transparent 20px,
      ${CARD_TEXT} 20px
    ),
    repeating-linear-gradient(
      270deg,
      ${CARD_TEXT},
      ${CARD_TEXT} 10px,
      transparent 10px,
      transparent 20px,
      ${CARD_TEXT} 20px
    );
  background-position:
    0 0,
    0 0,
    100% 0,
    0 100%;
  background-repeat: no-repeat;
  background-size:
    2px 100%,
    100% 2px,
    2px 100%,
    100% 2px;
  border-radius: 4px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const Headline = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
  padding: 16px;
  text-align: center;
`;

const Buttons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 200px;
  width: 100%;
`;

const PrimaryButton = styled.span`
  align-items: center;
  background: ${CARD_TEXT};
  border: 1px solid transparent;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  color: ${BG_DARK};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  justify-content: center;
  padding: 7px 12px;
  width: 100%;
`;

const SecondaryButton = styled.span`
  align-items: center;
  background: transparent;
  border: 1px solid ${CARD_BORDER};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${CARD_TEXT};
  display: flex;
  font-size: 13px;
  font-weight: 600;
  justify-content: center;
  padding: 7px 12px;
  width: 100%;
`;

const FooterNote = styled.span`
  bottom: 16px;
  color: ${CARD_TEXT_TERTIARY};
  font-size: 11px;
  left: 50%;
  padding: 0 16px;
  position: absolute;
  text-align: center;
  transform: translateX(-50%);
  width: 100%;
`;

type ImportVisualProps = {
  active: boolean;
};

export function ImportVisual({ active: _active }: ImportVisualProps) {
  return (
    <Root>
      <DropZone>
        <Headline>Upload .xlsx, .xls or .csv file</Headline>
        <Buttons>
          <PrimaryButton>Select file</PrimaryButton>
          <SecondaryButton>Download sample</SecondaryButton>
        </Buttons>
        <FooterNote>
          Max import capacity: 100,000 records. Otherwise, consider splitting
          your file or using the API.
        </FooterNote>
      </DropZone>
    </Root>
  );
}
