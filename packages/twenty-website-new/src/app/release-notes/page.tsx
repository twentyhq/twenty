import { MENU_DATA } from '@/app/_constants';
import {
  RELEASE_NOTES_HERO_BODY,
  RELEASE_NOTES_HERO_HEADING,
} from '@/app/release-notes/_constants/hero';
import { LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { fetchLatestGithubReleaseTag } from '@/lib/github/fetch-latest-release-tag';
import { getVisibleReleaseNotes } from '@/lib/releases/get-visible-releases';
import { loadLocalReleaseNotes } from '@/lib/releases/load-local-release-notes';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { ReleaseNotes } from '@/sections/ReleaseNotes/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';
import { Fragment } from 'react';

export const metadata: Metadata = {
  title: 'Release notes — Twenty',
  description:
    'Discover the newest features and improvements in Twenty, the open-source CRM.',
};

export default async function ReleaseNotesPage() {
  const allNotes = loadLocalReleaseNotes();
  const [latestTag, stats] = await Promise.all([
    fetchLatestGithubReleaseTag(),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const visibleNotes =
    process.env.NODE_ENV === 'development'
      ? allNotes
      : getVisibleReleaseNotes(allNotes, latestTag);

  return (
    <>
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
        <Hero.Heading
          page={Pages.ReleaseNotes}
          segments={RELEASE_NOTES_HERO_HEADING}
          size="lg"
          weight="light"
        />
        <Hero.Body
          page={Pages.ReleaseNotes}
          body={RELEASE_NOTES_HERO_BODY}
          size="sm"
        />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://github.com/twentyhq/twenty/releases"
            label="GitHub releases"
            type="anchor"
            variant="outlined"
          />
        </Hero.Cta>
      </Hero.Root>

      <ReleaseNotes.Root>
        {allNotes.length === 0 ? (
          <ReleaseNotes.EmptyMessage>
            Release notes were not found. This app reads release MDX from{' '}
            <strong>packages/twenty-website/src/content/releases</strong> in the
            monorepo. Ensure that folder is present when building or running
            locally.
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
