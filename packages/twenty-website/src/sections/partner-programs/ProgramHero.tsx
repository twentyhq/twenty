import { type MessageDescriptor } from '@lingui/core';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { fontSize, mediaUp, REDUCED_MOTION, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

// The copy dissolves as it scrolls under the menu, over the first 420px.
const Intro = styled.div`
  animation-duration: auto;
  animation-fill-mode: both;
  animation-name: program-hero-dissolve;
  animation-range: 0 420px;
  animation-timeline: scroll(root);
  animation-timing-function: linear;
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  max-width: 760px;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(5)};
  }

  @keyframes program-hero-dissolve {
    to {
      filter: blur(8px);
      opacity: 0;
      transform: translate3d(0, -40px, 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const heroTitleClassName = css`
  ${mediaUp('lg')} {
    &[data-size][data-family] {
      font-size: ${fontSize(20)};
      line-height: ${fontSize(21.5)};
    }
  }
`;

// The photo is behind; the copy alone holds the first screen.
const PhotoStage = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 420px;

  ${mediaUp('md')} {
    min-height: 620px;
  }
`;

const BodyMeasure = styled.div`
  max-width: 480px;
`;

const Actions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
  padding-top: ${spacing(3)};
`;

type ProgramHeroProps = {
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  actions: ReactNode;
  backdrop: ReactNode;
};

export function ProgramHero({
  eyebrow,
  heading,
  body,
  actions,
  backdrop,
}: ProgramHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={backdrop}
      fullBleedBackground
      rhythm="hero"
      scheme="dark"
    >
      <PhotoStage>
        <Intro data-halftone-exclude="">
          <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
          <Heading
            as="h1"
            className={heroTitleClassName}
            size="lg"
            weight="light"
          >
            {i18n._(heading)}
          </Heading>
          <BodyMeasure>
            <Body muted>{i18n._(body)}</Body>
          </BodyMeasure>
          <Actions>{actions}</Actions>
        </Intro>
      </PhotoStage>
    </SectionShell>
  );
}
