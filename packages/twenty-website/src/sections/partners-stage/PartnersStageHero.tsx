import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, EASING, mediaUp, REDUCED_MOTION, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

// Colour comes from light, not fills: one blue source above the map, fading
// into the page black.
const StageLight = styled.div`
  @keyframes partnersStageLightEnter {
    from {
      opacity: 0;
      transform: translate3d(0, -6%, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: partnersStageLightEnter 2200ms ${EASING.gentle} both;
  background:
    radial-gradient(
      ellipse 46% 52% at 52% 4%,
      ${color('blue-40')} 0%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 90% 70% at 50% 0%,
      ${color('blue-10')} 0%,
      transparent 70%
    );
  inset: 0;
  position: absolute;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const HeroStack = styled.div`
  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(12)};
    }
  }
`;

const IntroRow = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    align-items: end;
    gap: ${spacing(12)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
  }
`;

const HeadingMeasure = styled.div`
  max-width: 820px;
`;

const IntroAside = styled.div`
  & > * + * {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    padding-bottom: ${spacing(2)};
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
`;

type PartnersStageHeroProps = {
  actions: ReactNode;
  atlas: ReactNode;
};

// PROTOTYPE
export function PartnersStageHero({ actions, atlas }: PartnersStageHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<StageLight />}
      fullBleedBackground
      rhythm="hero"
      scheme="dark"
    >
      <HeroStack>
        {atlas}
        <IntroRow>
          <HeadingMeasure>
            <Heading as="h1" size="xl" weight="light">
              {i18n._(msg`Hire the people who *build on Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <IntroAside>
            <Body muted size="md">
              {i18n._(
                msg`Certified partners who set up your CRM to match how your company works, from the migration to the custom apps.`,
              )}
            </Body>
            <CtaRow>{actions}</CtaRow>
          </IntroAside>
        </IntroRow>
      </HeroStack>
    </SectionShell>
  );
}
