import AvatarGrid from '@/app/components/AvatarGrid';
import { Header } from '@/app/components/developers/contributors/Header';
import { Background } from '@/app/components/oss-friends/Background';
import { ContentContainer } from '@/app/components/oss-friends/ContentContainer';
import { findAll } from '@/database/database';
import { pullRequestModel, userModel } from '@/database/model';

interface Contributor {
  id: string;
  avatarUrl: string;
}

const Contributors = async () => {
  const contributors = await findAll(userModel);
  const pullRequests = await findAll(pullRequestModel);

  const fitlerContributors = contributors
    .filter((contributor) => contributor.isEmployee === '0')
    .filter(
      (contributor) =>
        ![
          'dependabot',
          'cyborch',
          'emilienchvt',
          'Samox',
          'nimraahmed',
          'gitstart-app',
        ].includes(contributor.id),
    )
    .map((contributor) => {
      contributor.pullRequestCount = pullRequests.filter(
        (pr) => pr.authorId === contributor.id,
      ).length;

      return contributor;
    })
    .sort((a, b) => b.pullRequestCount - a.pullRequestCount)
    .filter((contributor) => contributor.pullRequestCount > 0);

  return (
    <>
      <Background />
      <ContentContainer>
        <Header />
        <div>
          <AvatarGrid users={fitlerContributors as Contributor[]} />
        </div>
      </ContentContainer>
    </>
  );
};

export default Contributors;
