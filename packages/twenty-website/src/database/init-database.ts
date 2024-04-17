import { global } from '@apollo/client/utilities/globals';
import { graphql } from '@octokit/graphql';

import { fetchAndSaveGithubStars } from '@/app/contributors/api/fetch-and-save-github-stars';
import { fetchAssignableUsers } from '@/app/contributors/api/fetch-assignable-users';
import { fetchIssuesPRs } from '@/app/contributors/api/fetch-issues-prs';
import { saveIssuesToDB } from '@/app/contributors/api/save-issues-to-db';
import { savePRsToDB } from '@/app/contributors/api/save-prs-to-db';
import { IssueNode, PullRequestNode } from '@/app/contributors/api/types';
import { migrate } from '@/database/database';

export const initDatabase = async () => {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Error('No GitHub token provided');
  }

  console.log('Synching data..');

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  await migrate();

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
  process.exit(0);
};

initDatabase();
