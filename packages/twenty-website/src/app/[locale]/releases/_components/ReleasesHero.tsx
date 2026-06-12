import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { HeadingPart, LinkButton } from '@/design-system/components';
import { GitHubIcon } from '@/icons';
import { getServerI18n } from '@/lib/i18n/server';
import { HeroBody, HeroCta, HeroHeading, HeroSection } from '@/templates/Hero';
import { ReleaseNotesVisual } from '@/sections/Hero';

export function ReleasesHero() {
  const i18n = getServerI18n();

  return (
    <HeroSection scheme="light">
      <HeroHeading size="lg" weight="light">
        <Trans>
          <HeadingPart fontFamily="serif">Latest</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">Releases</HeadingPart>
        </Trans>
      </HeroHeading>
      <HeroBody maxWidthMd={591} size="sm">
        <Trans>
          Discover the newest features and improvements in Twenty,
          <br />
          the #1 Open Source CRM.
        </Trans>
      </HeroBody>
      <HeroCta>
        <LinkButton
          color="secondary"
          href="https://github.com/twentyhq/twenty/releases"
          label={i18n._(msg`Technical notes`)}
          leadingIcon={<GitHubIcon fillColor="currentColor" size={14} />}
          variant="outlined"
        />
      </HeroCta>
      <ReleaseNotesVisual />
    </HeroSection>
  );
}
