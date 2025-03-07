import { findAll } from '@/database/database';
import { pullRequestModel, userModel } from '@/database/model';
import { TWENTY_TEAM_MEMBERS } from '@/shared-utils/listTeamMembers';

export const getContributorActivity = async (username: string) => {
  const contributors = await findAll(userModel);

  const contributor = contributors.find((contributor) => {
    return contributor.id === username;
  });

  if (!contributor) {
    return;
  }

  const pullRequests = await findAll(pullRequestModel);
  const mergedPullRequests = pullRequests
    .filter((pr) => pr.mergedAt !== null)
    .filter((pr) => !TWENTY_TEAM_MEMBERS.includes(pr.authorId));

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
      (contributor) => contributor.authorId === username,
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

  const firstContributionAt = pullRequestActivityArray[0]?.day;
  const mergedPRsCount = mergedContributorPullRequests.length;
  const rank = Math.ceil(Number(contributorRank)).toFixed(0);
  const activeDays = pullRequestActivityArray.length;
  const contributorAvatar = contributor.avatarUrl;

  return {
    firstContributionAt,
    mergedPRsCount,
    rank,
    activeDays,
    pullRequestActivityArray,
    contributorPullRequests,
    contributorAvatar,
    contributor,
  };
};
