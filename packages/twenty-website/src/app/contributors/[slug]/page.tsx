export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

import { ActivityLog } from '@/app/_components/contributors/ActivityLog';
import { Breadcrumb } from '@/app/_components/contributors/Breadcrumb';
import { ContentContainer } from '@/app/_components/contributors/ContentContainer';
import { ProfileCard } from '@/app/_components/contributors/ProfileCard';
import { ProfileInfo } from '@/app/_components/contributors/ProfileInfo';
import { PullRequests } from '@/app/_components/contributors/PullRequests';
import { ThankYou } from '@/app/_components/contributors/ThankYou';
import { Background } from '@/app/_components/oss-friends/Background';
import { findAll } from '@/database/database';
import { pullRequestModel, userModel } from '@/database/model';

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return {
    title: 'Twenty - ' + params.slug,
    description:
      'Explore the impactful contributions of ' +
      params.slug +
      ' on the Twenty Github Repo. Discover their merged pull requests, ongoing work, and top ranking. Join and contribute to the #1 Open-Source CRM thriving community!',
  };
}

export default async function ({ params }: { params: { slug: string } }) {
  const contributors = await findAll(userModel);

  const contributor = contributors.find(
    (contributor) => contributor.id === params.slug,
  );

  if (!contributor) {
    return;
  }

  const pullRequests = await findAll(pullRequestModel);
  const mergedPullRequests = pullRequests
    .filter((pr) => pr.mergedAt !== null)
    .filter(
      (pr) =>
        ![
          'dependabot',
          'cyborch',
          'emilienchvt',
          'Samox',
          'charlesBochet',
          'gitstart-app',
          'thaisguigon',
          'lucasbordeau',
          'magrinj',
          'Weiko',
          'gitstart-twenty',
          'bosiraphael',
          'martmull',
          'FelixMalfait',
          'thomtrp',
          'Bonapara',
          'nimraahmed',
        ].includes(pr.authorId),
    );

  const contributorPullRequests = pullRequests.filter(
    (pr) => pr.authorId === contributor.id,
  );
  const mergedContributorPullRequests = contributorPullRequests.filter(
    (pr) => pr.mergedAt !== null,
  );

  const mergedContributorPullRequestsByContributor = mergedPullRequests.reduce(
    (acc, pr) => {
      acc[pr.authorId] = (acc[pr.authorId] || 0) + 1;
      return acc;
    },
    {},
  );

  const mergedContributorPullRequestsByContributorArray = Object.entries(
    mergedContributorPullRequestsByContributor,
  )
    .map(([authorId, value]) => ({ authorId, value }))
    .sort((a, b) => b.value - a.value);

  const contributorRank =
    ((mergedContributorPullRequestsByContributorArray.findIndex(
      (contributor) => contributor.authorId === params.slug,
    ) +
      1) /
      contributors.length) *
    100;

  const pullRequestActivity = contributorPullRequests.reduce((acc, pr) => {
    const date = new Date(pr.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, []);

  const pullRequestActivityArray = Object.entries(pullRequestActivity)
    .map(([day, value]) => ({ day, value }))
    .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

  return (
    <Background>
      <ContentContainer>
        <Breadcrumb active={contributor.id} />
        <ProfileCard
          username={contributor.id}
          avatarUrl={contributor.avatarUrl}
          firstContributionAt={pullRequestActivityArray[0]?.day}
        />
        <ProfileInfo
          mergedPRsCount={mergedContributorPullRequests.length}
          rank={Math.ceil(Number(contributorRank)).toFixed(0)}
          activeDays={pullRequestActivityArray.length}
        />
        <ActivityLog data={pullRequestActivityArray} />
        <PullRequests
          list={
            contributorPullRequests.slice(0, 9) as {
              id: string;
              title: string;
              url: string;
              createdAt: string;
              mergedAt: string | null;
              authorId: string;
            }[]
          }
        />
        <ThankYou username={contributor.id} />
      </ContentContainer>
    </Background>
  );
}
