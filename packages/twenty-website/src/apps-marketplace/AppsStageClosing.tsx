import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { PlusMark } from '@/icons';
import { color, mediaUp, semanticColor, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { AppsStageCorners } from './AppsStageCorners';

// PROTOTYPE (?direction=d): the closing band, on the same dark stage. The
// empty dashed tile is the place left for the visitor's own app.
const Band = styled.div`
  border: 1px solid ${semanticColor.line};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding: ${spacing(8)} ${spacing(5)};
  position: relative;

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(12)};
    grid-template-columns: auto minmax(0, 1fr) auto;
    padding: ${spacing(14)} ${spacing(12)};

    & > * + * {
      margin-top: 0;
    }
  }
`;

const EmptyTile = styled.div`
  align-items: center;
  border: 1px dashed ${semanticColor.lineStrong};
  border-radius: 9%;
  color: ${color('yellow')};
  display: flex;
  height: 72px;
  justify-content: center;
  width: 72px;

  ${mediaUp('md')} {
    height: 112px;
    width: 112px;
  }
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const BodyMeasure = styled.div`
  max-width: 520px;
`;

type AppsStageClosingProps = {
  heading: string;
  body: string;
  actions: ReactNode;
};

export function AppsStageClosing({
  heading,
  body,
  actions,
}: AppsStageClosingProps) {
  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Band>
        <AppsStageCorners />
        <EmptyTile aria-hidden>
          <PlusMark sizePx={16} />
        </EmptyTile>
        <Copy>
          <Heading as="h2" size="md" weight="light">
            {heading}
          </Heading>
          <BodyMeasure>
            <Body muted size="sm">
              {body}
            </Body>
          </BodyMeasure>
        </Copy>
        {/* Marks the page's primary action for the floating dock. */}
        <div data-apps-stage-primary="">{actions}</div>
      </Band>
    </SectionShell>
  );
}
