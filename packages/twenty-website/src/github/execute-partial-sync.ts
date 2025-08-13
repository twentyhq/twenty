import { graphql } from '@octokit/graphql';

import { fetchAssignableUsers } from '@/github/contributors/fetch-assignable-users';
import { saveIssuesToDB } from '@/github/contributors/save-issues-to-db';
import { savePRsToDB } from '@/github/contributors/save-prs-to-db';
import { searchIssuesPRs } from '@/github/contributors/search-issues-prs';
import {
  type IssueNode,
  type PullRequestNode,
} from '@/github/contributors/types';
import { fetchAndSaveGithubReleases } from '@/github/github-releases/fetch-and-save-github-releases';
import { fetchAndSaveGithubStars } from '@/github/github-stars/fetch-and-save-github-stars';

export const executePartialSync = async () => {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Error('No GitHub token provided');
  }

  console.log('Syncing data... (partial sync)');

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  await fetchAndSaveGithubStars(query);
  await fetchAndSaveGithubReleases(query);

  const assignableUsers = await fetchAssignableUsers(query);

  const fetchedPRs = (await searchIssuesPRs(
    query,
    null,
    false,
    [],
  )) as Array<PullRequestNode>;
  const fetchedIssues = (await searchIssuesPRs(
    query,
    null,
    true,
    [],
  )) as Array<IssueNode>;

  await savePRsToDB(fetchedPRs, assignableUsers);
  await saveIssuesToDB(fetchedIssues, assignableUsers);

  console.log('data synched!');
};
