'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { AppsStageBackdrop } from './AppsStageBackdrop';
import { AppsStageDock } from './AppsStageDock';
import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=d): the Marketplace hero. The logos are the picture,
// set large on a dark stage they light themselves; the title is the caption.
const Stage = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${spacing(8)};

  ${mediaUp('md')} {
    padding-top: ${spacing(14)};
  }
`;

// ui/Eyebrow with the marker in this page's accent (yellow, dark only).
const StageEyebrow = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('eyebrow')}
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  letter-spacing: -0.04em;
`;

const StageEyebrowMarker = styled.span`
  background-color: ${color('yellow')};
  border-radius: 1px;
  flex-shrink: 0;
  height: 7px;
  width: 14px;
`;

const Rule = styled.div`
  align-items: center;
  color: ${color('yellow')};
  display: flex;
  gap: ${spacing(1.5)};
  margin-top: ${spacing(10)};

  ${mediaUp('md')} {
    margin-top: ${spacing(18)};
  }
`;

const RuleLine = styled.div`
  animation: apps-stage-rule-draw calc(${DURATION.xl} * 2) ${EASING.standard}
    ${DURATION.md} both;
  background-color: ${semanticColor.line};
  flex: 1 1 0%;
  height: 1px;
  transform-origin: 0 50%;

  @keyframes apps-stage-rule-draw {
    from {
      transform: scaleX(0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Caption = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-top: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    margin-top: ${spacing(12)};
  }

  /* Side by side only once the one-line title leaves room for the text. */
  ${mediaUp('lg')} {
    align-items: end;
    column-gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const TitleStack = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Rise = styled.div`
  animation: apps-stage-copy-rise ${DURATION.xl} ${EASING.standard} both;
  animation-delay: calc(var(--apps-stage-step) * 110ms + 350ms);

  @keyframes apps-stage-copy-rise {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

// The title comes up from behind its own baseline.
const TitleMask = styled.div`
  overflow: hidden;
  padding-bottom: 0.12em;

  & > * {
    animation: apps-stage-title-rise calc(${DURATION.xl} * 1.5)
      ${EASING.standard} ${DURATION.lg} both;
  }

  @keyframes apps-stage-title-rise {
    from {
      transform: translateY(105%);
    }
  }

  ${REDUCED_MOTION} {
    & > * {
      animation: none;
    }
  }
`;

const Aside = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

type AppsStageHeroProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsStageHero({ apps }: AppsStageHeroProps) {
  const { i18n } = useLingui();
  const inks = useAppsStageLogoInks(apps);

  return (
    <SectionShell
      background={<AppsStageBackdrop />}
      fullBleedBackground
      rhythm="hero"
      scheme="dark"
    >
      <Stage>
        {apps.length > 0 && <AppsStageDock apps={apps} inks={inks} />}
        <Rule aria-hidden>
          <PlusMark sizePx={12} />
          <RuleLine />
          <PlusMark sizePx={12} />
        </Rule>
        <Caption>
          <TitleStack>
            <Rise style={{ '--apps-stage-step': 0 } as React.CSSProperties}>
              <StageEyebrow>
                <StageEyebrowMarker aria-hidden />
                {i18n._(msg`Marketplace`)}
              </StageEyebrow>
            </Rise>
            <TitleMask>
              <Heading as="h1" size="xl" weight="light">
                {i18n._(msg`Apps for *Twenty*`)}
              </Heading>
            </TitleMask>
          </TitleStack>
          <Aside>
            <Rise style={{ '--apps-stage-step': 2 } as React.CSSProperties}>
              <Body muted size="sm">
                {i18n._(
                  msg`Extend your CRM with apps from Twenty and its community. Every app here is reviewed by our team for security and quality — install one in a click and it's live in your workspace.`,
                )}
              </Body>
            </Rise>
          </Aside>
        </Caption>
      </Stage>
    </SectionShell>
  );
}
