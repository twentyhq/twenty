import { msg } from '@lingui/core/macro';

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
        <HeadingPart fontFamily="serif">{i18n._(msg`Latest`)}</HeadingPart>
        <br />
        <HeadingPart fontFamily="sans">{i18n._(msg`Releases`)}</HeadingPart>
      </HeroHeading>
      <HeroBody maxWidthMd={591} preserveLineBreaks size="sm">
        {i18n._(
          msg`Discover the newest features and improvements in Twenty,\nthe #1 Open Source CRM.`,
        )}
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
