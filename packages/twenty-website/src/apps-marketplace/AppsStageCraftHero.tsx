'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  containerColumnDeclarations,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { AppsStageOrbit } from './AppsStageOrbit';
import { type MarketplaceApp } from './marketplace-app';

const Backdrop = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  inset: 0;
  position: absolute;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 560px;
  padding-top: ${spacing(16)};
  ${containerColumnDeclarations()}

  ${mediaUp('sm')} {
    height: 680px;
  }

  ${mediaUp('md')} {
    height: 760px;
    padding-top: ${spacing(35)};
  }
`;

const Copy = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Label = styled.p`
  animation: apps-stage-craft-rise ${DURATION.xl} ${EASING.standard} both;
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  line-height: 16px;
  text-transform: uppercase;

  @keyframes apps-stage-craft-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Title = styled.div`
  animation: apps-stage-craft-rise ${DURATION.xl} ${EASING.standard} 80ms both;
  color: ${color('neutral')};

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Lede = styled.p`
  animation: apps-stage-craft-rise ${DURATION.xl} ${EASING.standard} 160ms both;
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.55;
  max-width: 480px;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type AppsStageCraftHeroProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageCraftHero({ apps }: AppsStageCraftHeroProps) {
  const { i18n } = useLingui();

  return (
    <SectionShell
      background={
        <>
          <Backdrop />
          <AppsStageOrbit apps={apps} />
        </>
      }
      flushInline
      fullBleedBackground
      rhythm="flush"
      scheme="dark"
    >
      <Column>
        <Copy data-apps-stage-copy="">
          <Label>{i18n._(msg`Marketplace`)}</Label>
          <Title>
            <Heading as="h1" size="xl" weight="light">
              {i18n._(msg`Apps for *Twenty*`)}
            </Heading>
          </Title>
          <Lede>
            {i18n._(
              msg`Every app is reviewed by our team for security and quality. Install one in a click, it's live in your workspace.`,
            )}
          </Lede>
        </Copy>
      </Column>
    </SectionShell>
  );
}
