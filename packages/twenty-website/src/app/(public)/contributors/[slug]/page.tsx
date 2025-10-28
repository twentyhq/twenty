export const dynamic = 'force-dynamic';

import { type Metadata } from 'next';

import { getContributorActivity } from '@/app/(public)/contributors/utils/get-contributor-activity';
import { ActivityLog } from '@/app/_components/contributors/ActivityLog';
import { Breadcrumb } from '@/app/_components/contributors/Breadcrumb';
import { ContentContainer } from '@/app/_components/contributors/ContentContainer';
import { ProfileCard } from '@/app/_components/contributors/ProfileCard';
import { ProfileInfo } from '@/app/_components/contributors/ProfileInfo';
import { ProfileSharing } from '@/app/_components/contributors/ProfileSharing';
import { PullRequests } from '@/app/_components/contributors/PullRequests';
import { ThankYou } from '@/app/_components/contributors/ThankYou';
import { Background } from '@/app/_components/oss-friends/Background';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    metadataBase: new URL(`https://twenty.com`),
    title: 'Twenty - ' + slug,
    description:
      'Explore the impactful contributions of ' +
      slug +
      ' on the Twenty Github Repo. Discover their merged pull requests, ongoing work, and top ranking. Join and contribute to the #1 Open-Source CRM thriving community!',
    openGraph: {
      images: [`https://twenty.com/api/contributors/${slug}/og.png`],
    },
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  try {
    const contributorActivity = await getContributorActivity(slug);
    if (contributorActivity) {
      const {
        firstContributionAt,
        mergedPRsCount,
        rank,
        activeDays,
        pullRequestActivityArray,
        contributorPullRequests,
        contributor,
      } = contributorActivity;

      return (
        <Background>
          <ContentContainer>
            <Breadcrumb active={contributor.id} />
            <ProfileCard
              username={contributor.id}
              avatarUrl={contributor.avatarUrl}
              firstContributionAt={firstContributionAt}
            />
            <ProfileInfo
              mergedPRsCount={mergedPRsCount}
              rank={rank}
              activeDays={activeDays}
            />
            <ProfileSharing username={contributor.id} />
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
  } catch (error) {
    console.error('error: ', error);
  }
}
