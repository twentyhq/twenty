import { global } from '@apollo/client/utilities/globals';
import { graphql } from '@octokit/graphql';

import { fetchAssignableUsers } from '@/github-sync/contributors/fetch-assignable-users';
import { fetchIssuesPRs } from '@/github-sync/contributors/fetch-issues-prs';
import { saveIssuesToDB } from '@/github-sync/contributors/save-issues-to-db';
import { savePRsToDB } from '@/github-sync/contributors/save-prs-to-db';
import { IssueNode, PullRequestNode } from '@/github-sync/contributors/types';
import { fetchAndSaveGithubStars } from '@/github-sync/github-stars/fetch-and-save-github-stars';

export const fetchAndSaveGithubData = async () => {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Error('No GitHub token provided');
  }

  console.log('Synching data..');

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  await fetchAndSaveGithubStars(query);

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

  savePRsToDB(fetchedPRs, assignableUsers);
  saveIssuesToDB(fetchedIssues, assignableUsers);

  console.log('data synched!');
};
