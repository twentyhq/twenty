import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { APPS_STAGE_CRAFT_COLUMN } from './apps-stage-craft-column';

// PROTOTYPE (?direction=e): the closing block, framed in the page column.
const Frame = styled.div`
  align-items: center;
  border: 1px solid ${semanticColor.line};
  /* The top joins the catalogue's column lines; only the end of the column
     is rounded. */
  border-radius: 0 0 ${radius(2)} ${radius(2)};
  color: ${color('neutral')};
  display: flex;
  flex-direction: column;
  padding: ${spacing(20)} ${spacing(6)} ${spacing(24)};
  text-align: center;
  ${APPS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(5)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(30)} ${spacing(6)} ${spacing(35)};
  }
`;

const Text = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 26px;
  max-width: 440px;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.25)};
  }
`;

const Actions = styled.div`
  padding-top: ${spacing(3)};
`;

const Bottom = styled.div`
  height: ${spacing(20)};

  ${mediaUp('md')} {
    height: ${spacing(30)};
  }
`;

type AppsStageCraftClosingProps = {
  actions: ReactNode;
  body: string;
  heading: string;
};

export function AppsStageCraftClosing({
  actions,
  body,
  heading,
}: AppsStageCraftClosingProps) {
  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame>
        <Heading size="lg" weight="light">
          {heading}
        </Heading>
        <Text>{body}</Text>
        <Actions>{actions}</Actions>
      </Frame>
      <Bottom />
    </SectionShell>
  );
}
