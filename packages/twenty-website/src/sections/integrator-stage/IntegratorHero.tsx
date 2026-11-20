import { type MessageDescriptor } from '@lingui/core';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { fontSize, mediaUp, semanticColor, spacing } from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

const HERO_OBJECT_SRC = '/images/menu/integrators.webp';

// Centred editorial hero, as on /apps; the ledger is the one object below.
const Stage = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Intro = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  max-width: 760px;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(5)};
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

const BodyMeasure = styled.div`
  max-width: 480px;
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
  padding-top: ${spacing(3)};
`;

// The menu's own illustration for this page, as the hero's lone object. The
// render sits on #141414; lighten lets the page surface show through it.
const ObjectFrame = styled.div`
  background-color: ${semanticColor.surface};
  height: 260px;
  isolation: isolate;
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    height: 400px;
  }

  & > img {
    left: 50%;
    mix-blend-mode: lighten;
    position: absolute;
    top: 50%;
    height: auto;
    transform: translate(-50%, -50%);
    width: 820px;

    ${mediaUp('md')} {
      width: 1240px;
    }
  }
`;

type IntegratorHeroProps = {
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  actions: ReactNode;
};

// PROTOTYPE direction d: centred like /apps, the money as the lone object.
export function IntegratorHero({
  eyebrow,
  heading,
  body,
  actions,
}: IntegratorHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="hero" scheme="dark">
      <Stage>
        <Intro>
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
          <CtaRow>{actions}</CtaRow>
        </Intro>
        <ObjectFrame>
          <NextImage
            alt=""
            height={1080}
            priority
            sizes="(min-width: 921px) 1240px, 820px"
            src={HERO_OBJECT_SRC}
            width={1920}
          />
        </ObjectFrame>
      </Stage>
    </SectionShell>
  );
}
