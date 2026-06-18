import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';

import { GitHubMark } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { GRADIENT, HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';
import { Body, Button, Heading, HeadingPair, SectionShell } from '@/ui';

import { ReleasesVisual } from './ReleasesVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The shared hero rhythm: Heading->Body 12px (HeadingPair), Body->CTA 32px,
// CTA->visual 68px (HERO_COMPOSITION).
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
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 450px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  width: 100%;
`;

export function ReleasesHero() {
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
              {i18n._(msg`Latest\n*Releases*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Discover the newest features and improvements in Twenty, the #1 Open Source CRM.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <CtaRow>
          <Button
            href="https://github.com/twentyhq/twenty/releases"
            label={i18n._(msg`Technical notes`)}
            leadingIcon={<GitHubMark size={14} />}
            variant="outlined"
          />
        </CtaRow>
      </IntroStack>
      <VisualStage>
        <ReleasesVisual />
      </VisualStage>
    </SectionShell>
  );
}
