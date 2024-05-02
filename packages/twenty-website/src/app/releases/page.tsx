import React from 'react';
import { desc } from 'drizzle-orm';
import { Metadata } from 'next';

import { Line } from '@/app/_components/releases/Line';
import { Release } from '@/app/_components/releases/Release';
import { Title } from '@/app/_components/releases/StyledTitle';
import { ContentContainer } from '@/app/_components/ui/layout/ContentContainer';
import { getGithubReleaseDateFromReleaseNote } from '@/app/releases/utils/get-github-release-date-from-release-note';
import {
  getMdxReleasesContent,
  getReleases,
} from '@/app/releases/utils/get-releases';
import { getVisibleReleases } from '@/app/releases/utils/get-visible-releases';
import { findAll } from '@/database/database';
import { GithubReleases, githubReleasesModel } from '@/database/model';
import { pgGithubReleasesModel } from '@/database/schema-postgres';

export const metadata: Metadata = {
  title: 'Twenty - Releases',
  description:
    'Discover the newest features and improvements in Twenty, the #1 open-source CRM.',
};

export const dynamic = 'force-dynamic';

const Home = async () => {
  const githubReleases = (await findAll(
    githubReleasesModel,
    desc(pgGithubReleasesModel.publishedAt),
  )) as GithubReleases[];

  const latestGithubRelease = githubReleases[0];
  const releaseNotes = await getReleases();

  const visibleReleasesNotes = getVisibleReleases(
    releaseNotes,
    latestGithubRelease.tagName,
  );

  const mdxReleasesContent = await getMdxReleasesContent(releaseNotes);

  return (
    <ContentContainer>
      <Title />

      {visibleReleasesNotes.map((note, index) => (
        <React.Fragment key={note.slug}>
          <Release
            githubPublishedAt={getGithubReleaseDateFromReleaseNote(
              githubReleases,
              note.release,
              note.date,
            )}
            release={note}
            mdxReleaseContent={mdxReleasesContent[index]}
          />
          {index != releaseNotes.length - 1 && <Line />}
        </React.Fragment>
      ))}
    </ContentContainer>
  );
};

export default Home;
