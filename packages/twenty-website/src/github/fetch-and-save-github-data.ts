import { global } from '@apollo/client/utilities/globals';
import { graphql } from '@octokit/graphql';

import { fetchAssignableUsers } from '@/github/contributors/fetch-assignable-users';
import { fetchIssuesPRs } from '@/github/contributors/fetch-issues-prs';
import { saveIssuesToDB } from '@/github/contributors/save-issues-to-db';
import { savePRsToDB } from '@/github/contributors/save-prs-to-db';
import { IssueNode, PullRequestNode } from '@/github/contributors/types';
import { fetchAndSaveGithubReleases } from '@/github/github-releases/fetch-and-save-github-releases';
import { fetchAndSaveGithubStars } from '@/github/github-stars/fetch-and-save-github-stars';

export const fetchAndSaveGithubData = async () => {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Error('No GitHub token provided');
  }

  console.log('Syncing data...');

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  await fetchAndSaveGithubStars(query);
  await fetchAndSaveGithubReleases(query);

  const assignableUsers = await fetchAssignableUsers(query);
  const fetchedPRs = (await fetchIssuesPRs(
    query,
    null,
    false,
    [],
  )) as Array<PullRequestNode>;
  const fetchedIssues = (await fetchIssuesPRs(
    query,
    null,
    true,
    [],
  )) as Array<IssueNode>;

  await savePRsToDB(fetchedPRs, assignableUsers);
  await saveIssuesToDB(fetchedIssues, assignableUsers);

  console.log('data synched!');
};
