import { msg } from '@lingui/core/macro';
import { MENU_DATA } from '@/sections/Menu/data';
import { RELEASE_NOTES_HERO_COPY } from '@/app/[locale]/releases/hero.data';
import { HeadingPart, LinkButton } from '@/design-system/components';
import { GitHubIcon } from '@/icons';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { fetchLatestGithubReleaseTag } from '@/lib/releases/fetch-latest-release-tag';
import { getVisibleReleaseNotes } from '@/lib/releases/get-visible-releases';
import { loadLocalReleaseNotes } from '@/lib/releases/load-local-release-notes';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { ReleaseNotes } from '@/sections/ReleaseNotes/components';
import { theme } from '@/theme';
import { buildReleaseListJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
import { Fragment } from 'react';

export const generateMetadata = buildRouteMetadata('releases');

type ReleasesPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ReleasesPage({ params }: ReleasesPageProps) {
  const allNotes = loadLocalReleaseNotes();
  const [i18n, latestTag, stats] = await Promise.all([
    getRouteI18n(params),
    fetchLatestGithubReleaseTag(),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const visibleNotes =
    process.env.NODE_ENV === 'development'
      ? allNotes
      : getVisibleReleaseNotes(allNotes, latestTag);

  return (
    <>
      {visibleNotes.length > 0 ? (
        <JsonLd data={buildReleaseListJsonLd(visibleNotes)} />
      ) : null}
      {/*
       * Above-the-fold milestone scene texture. Preload kicks off the
       * fetch in parallel with the JS chunk download.
       */}
      <link
        as="image"
        href="/illustrations/generated/milestone.jpg"
        rel="preload"
      />
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.ReleaseNotes} size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {renderText(msg`Latest`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {renderText(msg`Releases`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body
          page={Pages.ReleaseNotes}
          body={{ text: RELEASE_NOTES_HERO_COPY.body }}
          renderText={renderText}
          size="sm"
        />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://github.com/twentyhq/twenty/releases"
            label={renderText(msg`Technical notes`)}
            leadingIcon={<GitHubIcon fillColor="currentColor" size={14} />}
            variant="outlined"
          />
        </Hero.Cta>
        <Hero.ReleaseNotesVisual />
      </Hero.Root>

      <ReleaseNotes.Root>
        {allNotes.length === 0 ? (
          <ReleaseNotes.EmptyMessage>
            Releases were not found. Add MDX under{' '}
            <strong>packages/twenty-website-new/src/content/releases</strong>{' '}
            and images under{' '}
            <strong>packages/twenty-website-new/public/images/releases</strong>.
          </ReleaseNotes.EmptyMessage>
        ) : visibleNotes.length === 0 ? (
          <ReleaseNotes.EmptyMessage>
            No releases are visible yet for the current published version.
          </ReleaseNotes.EmptyMessage>
        ) : (
          visibleNotes.map((note, index) => (
            <Fragment key={note.slug}>
              <ReleaseNotes.ReleaseEntry
                content={note.content}
                date={note.date}
                release={note.release}
              />
              {index < visibleNotes.length - 1 ? (
                <ReleaseNotes.Divider />
              ) : null}
            </Fragment>
          ))
        )}
      </ReleaseNotes.Root>
    </>
  );
}
