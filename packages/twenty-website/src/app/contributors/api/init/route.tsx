export const dynamic = 'force-dynamic';

import { global } from '@apollo/client/utilities/globals';
import { graphql } from '@octokit/graphql';

import { fetchAssignableUsers } from '@/app/contributors/api/fetch-assignable-users';
import { fetchIssuesPRs } from '@/app/contributors/api/fetch-issues-prs';
import { saveIssuesToDB } from '@/app/contributors/api/save-issues-to-db';
import { savePRsToDB } from '@/app/contributors/api/save-prs-to-db';
import { IssueNode, PullRequestNode } from '@/app/contributors/api/types';
import { migrate } from '@/database/database';

export async function GET() {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Response('No GitHub token provided', { status: 500 });
  }

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  await migrate();

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

  return new Response('Data synced', {
    status: 200,
  });
}
