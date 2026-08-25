import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { GetMatchedButton } from '@/client-brief';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { BrowseDirectoryButton } from './BrowseDirectoryButton';
import { PartnerVisual } from './PartnerVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// Same composition as the recruitment hero: Heading->Body 12px (HeadingPair),
// then a single 32px step down the intro, then the stage at the shared
// CTA-to-visual measure.
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 760px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  justify-content: center;

  ${mediaUp('sm')} {
    flex-direction: row;
  }
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function PartnerLeadHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="light"
    >
      <IntroStack>
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Tell us what you need, we match you in *48 hours*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Skip the browsing. Describe your project and we connect you with a certified Twenty partner who fits it.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <GetMatchedButton label={msg`Get matched`} />
          <BrowseDirectoryButton />
        </CtaRow>
      </IntroStack>
      <VisualStage>
        <PartnerVisual />
      </VisualStage>
    </SectionShell>
  );
}
