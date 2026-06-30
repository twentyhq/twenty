import { danger } from 'danger';

const ordinalSuffix = (number: number) => {
  const v = number % 100;
  if (v === 11 || v === 12 || v === 13) {
    return number + 'th';
  }
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return number + (suffixes[v % 10] || 'th');
};

const fetchContributorStats = async (username: string) => {
  const apiUrl = `https://twenty.com/api/contributors/contributorStats/${username}`;

  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
};

const fetchContributorImage = async (username: string) => {
  const apiUrl = `https://twenty.com/api/contributors/${username}/og.png`;

  await fetch(apiUrl);
};

const runCongratulate = async () => {
  const pullRequest = danger.github.pr;
  const userName = pullRequest.user.login;
  const teamMembers = [
    'ady-beraud',
    'AMoreaux',
    'Bonapara',
    'bosiraphael',
    'charlesBochet',
    'cyborch',
    'dependabot',
    'Devessier',
    'emilienchvt',
    'etiennejouan',
    'FelixMalfait',
    'Freebios',
    'gitstart-app',
    'gitstart-twenty',
    'guillim',
    'ijreilly',
    'lucasbordeau',
    'magrinj',
    'martmull',
    'nimraahmed',
    'prastoin',
    'Samox',
    'thaisguigon',
    'thomtrp',
    'Weiko',
  ];

  if (teamMembers.includes(userName)) {
    return;
  }

  const { data: pullRequests } =
    await danger.github.api.rest.search.issuesAndPullRequests({
      q: `is:pr author:${userName} is:closed repo:twentyhq/twenty`,
      per_page: 2,
      page: 1,
    });

  const isFirstPR = pullRequests.total_count === 1;

  if (isFirstPR) {
    return;
  }

  const stats = await fetchContributorStats(userName);
  const contributorUrl = `https://twenty.com/contributors/${userName}`;

  // Pre-fetch to trigger cloudflare cache
  await fetchContributorImage(userName);

  const message =
    `Thanks @${userName} for your contribution!\n` +
    `This marks your **${ordinalSuffix(
      stats.mergedPRsCount,
    )}** PR on the repo. ` +
    `You're **top ${stats.rank}%** of all our contributors 🎉\n` +
    `[See contributor page](${contributorUrl}) - ` +
    `[Share on LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=${contributorUrl}) - ` +
    `[Share on Twitter](https://www.twitter.com/share?url=${contributorUrl})\n\n` +
    `![Contributions](https://twenty.com/api/contributors/${userName}/og.png)`;

  await danger.github.api.rest.issues.createComment({
    owner: danger.github.thisPR.owner,
    repo: danger.github.thisPR.repo,
    issue_number: danger.github.thisPR.pull_number,
    body: message,
  });
};

if (danger.github && danger.github.pr.merged) {
  runCongratulate();
}
