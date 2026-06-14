import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, GuideCrosshair, Heading, SectionShell } from '@/ui';

const CROSSHAIR_EDGE_INSET = '120px';

const Inner = styled.div`
  & > * + * {
    margin-top: ${spacing(12)};
  }
`;

const Intro = styled.div`
  max-width: 760px;

  & > * + * {
    margin-top: ${spacing(6)};
  }

  &[data-align='right'] {
    ${mediaUp('md')} {
      margin-left: auto;
      text-align: right;
    }
  }
`;

const TwoColumn = styled.div`
  column-gap: ${spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-inline: auto;
  max-width: 902px;
  row-gap: ${spacing(6)};

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &[data-align='left'] {
      margin-left: 0;
    }

    &[data-align='right'] {
      margin-right: 0;
    }
  }
`;

export type EditorialProps = {
  align: 'left' | 'right';
  eyebrow: string;
  heading: string;
  paragraphs: readonly [string, string];
};

export function Editorial({
  align,
  eyebrow,
  heading,
  paragraphs,
}: EditorialProps) {
  const crossX =
    align === 'left'
      ? `calc(100% - ${CROSSHAIR_EDGE_INSET})`
      : CROSSHAIR_EDGE_INSET;

  return (
    <SectionShell
      background={
        <GuideCrosshair contained crossX={crossX} crossY={spacing(3)} />
      }
      keepsTopRhythm
      rhythm="section"
      scheme="dark"
    >
      <Inner>
        <Intro data-align={align}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {heading}
          </Heading>
        </Intro>
        <TwoColumn data-align={align}>
          <Body muted size="sm">
            {paragraphs[0]}
          </Body>
          <Body muted size="sm">
            {paragraphs[1]}
          </Body>
        </TwoColumn>
      </Inner>
    </SectionShell>
  );
}
