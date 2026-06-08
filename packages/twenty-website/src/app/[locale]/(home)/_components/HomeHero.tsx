import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';

import { HeadingPart, LinkButton } from '@/design-system/components';
import { getServerI18n } from '@/lib/i18n/server';
import { WebGlMount } from '@/lib/visual-runtime';
import { APP_PREVIEW_DATA, AppPreview } from '@/sections/AppPreview';
import { TalkToUsButton } from '@/sections/ContactCal';
import { HeroBody, HeroCta, HeroHeading, HeroSection } from '@/templates/Hero';
import { HomeBackgroundHalftone } from '@/sections/Hero/visuals/components/HomeBackgroundHalftone';
import { theme } from '@/theme';

const HeroHeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  width: 100%;

  > *:last-child {
    margin-top: 0;
  }
`;

const HeroIntroGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(8)};
  width: 100%;
`;

export function HomeHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection
      scheme="muted"
      background={
        <WebGlMount priority>
          <HomeBackgroundHalftone />
        </WebGlMount>
      }
    >
      <HeroIntroGroup data-halftone-exclude>
        <HeroHeadingGroup>
          <HeroHeading>
            <Trans>
              <HeadingPart fontFamily="serif">
                Build your Enterprise CRM
              </HeadingPart>
              <HeadingPart fontFamily="sans">at AI Speed</HeadingPart>
            </Trans>
          </HeroHeading>
          <HeroBody maxWidthMd={591} size="sm">
            <Trans>
              Twenty gives technical teams the building blocks for a custom CRM
              that meets complex business needs and quickly adapts as the
              business evolves.
            </Trans>
          </HeroBody>
        </HeroHeadingGroup>
        <HeroCta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Get started`)}
            variant="contained"
          />
          <TalkToUsButton
            color="secondary"
            label={msg`Talk to us`}
            variant="outlined"
          />
        </HeroCta>
      </HeroIntroGroup>
      <AppPreview visual={APP_PREVIEW_DATA.visual} />
    </HeroSection>
  );
}
