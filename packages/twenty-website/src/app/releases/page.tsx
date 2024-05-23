import React from 'react';
import { desc } from 'drizzle-orm';
import { Metadata } from 'next';

import { ReleaseContainer } from '@/app/_components/releases/ReleaseContainer';
import { Title } from '@/app/_components/releases/StyledTitle';
import { ContentContainer } from '@/app/_components/ui/layout/ContentContainer';
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
      <ReleaseContainer
        visibleReleasesNotes={visibleReleasesNotes}
        githubReleases={githubReleases}
        mdxReleasesContent={mdxReleasesContent}
      />
    </ContentContainer>
  );
};

export default Home;
