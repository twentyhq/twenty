import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { fetchLatestGithubReleaseTag } from '@/lib/releases/fetch-latest-release-tag';
import { getVisibleReleaseNotes } from '@/lib/releases/get-visible-releases';
import { loadLocalReleaseNotes } from '@/lib/releases/load-local-release-notes';
import { ReleasesHero } from '@/app/[locale]/releases/_components/ReleasesHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import {
  ReleaseNotesDivider,
  ReleaseNotesEmptyMessage,
  ReleaseNotesReleaseEntry,
  ReleaseNotesSection,
} from '@/sections/ReleaseNotes';
import { theme } from '@/theme';
import { buildReleaseListJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
import { Fragment } from 'react';

export const dynamic = 'force-static';

export const generateMetadata = buildRouteMetadata('releases');

type ReleasesPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function ReleasesPage({ params }: ReleasesPageProps) {
  const allNotes = loadLocalReleaseNotes();
  const [, latestTag, stats] = await Promise.all([
    getRouteI18n(params),
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
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />

      <ReleasesHero />

      <ReleaseNotesSection>
        {allNotes.length === 0 ? (
          <ReleaseNotesEmptyMessage>
            Releases were not found. Add MDX under{' '}
            <strong>packages/twenty-website/src/content/releases</strong> and
            images under{' '}
            <strong>packages/twenty-website/public/images/releases</strong>.
          </ReleaseNotesEmptyMessage>
        ) : visibleNotes.length === 0 ? (
          <ReleaseNotesEmptyMessage>
            No releases are visible yet for the current published version.
          </ReleaseNotesEmptyMessage>
        ) : (
          visibleNotes.map((note, index) => (
            <Fragment key={note.slug}>
              <ReleaseNotesReleaseEntry
                content={note.content}
                date={note.date}
                release={note.release}
              />
              {index < visibleNotes.length - 1 ? <ReleaseNotesDivider /> : null}
            </Fragment>
          ))
        )}
      </ReleaseNotesSection>
    </>
  );
}
