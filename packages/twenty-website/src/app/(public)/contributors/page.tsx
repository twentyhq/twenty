export const dynamic = 'force-dynamic';

import AvatarGrid from '@/app/_components/contributors/AvatarGrid';
import { Header } from '@/app/_components/contributors/Header';
import { Background } from '@/app/_components/oss-friends/Background';
import { ContentContainer } from '@/app/_components/oss-friends/ContentContainer';
import { findAll } from '@/database/database';
import { pullRequestModel, userModel } from '@/database/model';
import { TWENTY_TEAM_MEMBERS } from '@/shared-utils/listTeamMembers';

export const metadata = {
  title: 'Twenty - Contributors',
  description:
    'Discover the brilliant minds behind Twenty.com. Meet our contributors and explore how their expertise contributes to making Twenty the leading open-source CRM. Join our community today.',
  icons: '/images/core/logo.svg',
};

interface Contributor {
  id: string;
  avatarUrl: string;
}

const Contributors = async () => {
  const contributors = await findAll(userModel);
  const pullRequests = await findAll(pullRequestModel);

  const pullRequestByAuthor = pullRequests.reduce((acc, pr) => {
    acc[pr.authorId] = acc[pr.authorId] ? acc[pr.authorId] + 1 : 1;
    return acc;
  }, {});

  const fitlerContributors = contributors
    .filter((contributor) => contributor.isEmployee === '0')
    .filter((contributor) => !TWENTY_TEAM_MEMBERS.includes(contributor.id))
    .map((contributor) => {
      contributor.pullRequestCount = pullRequestByAuthor[contributor.id] || 0;

      return contributor;
    })
    .sort((a, b) => b.pullRequestCount - a.pullRequestCount)
    .filter((contributor) => contributor.pullRequestCount > 0);

  return (
    <Background>
      <ContentContainer>
        <Header />
        <AvatarGrid users={fitlerContributors as Contributor[]} />
      </ContentContainer>
    </Background>
  );
};

export default Contributors;
