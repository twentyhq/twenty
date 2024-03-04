import { graphql } from '@octokit/graphql';
import { desc } from 'drizzle-orm';

import { fetchAssignableUsers } from '@/app/contributors/api/fetch-assignable-users';
import { saveIssuesToDB } from '@/app/contributors/api/save-issues-to-db';
import { savePRsToDB } from '@/app/contributors/api/save-prs-to-db';
import { searchIssuesPRs } from '@/app/contributors/api/search-issues-prs';
import { IssueNode, PullRequestNode } from '@/app/contributors/api/types';
import { findOne } from '@/database/database';
import { issueModel, pullRequestModel } from '@/database/model';

export async function GET() {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Response('No GitHub token provided', { status: 500 });
  }

  const query = graphql.defaults({
    headers: {
      Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
    },
  });

  const assignableUsers = await fetchAssignableUsers(query);

  const mostRecentPR = findOne(
    pullRequestModel,
    desc(pullRequestModel.updatedAt),
  );

  const mostRecentIssue = findOne(issueModel, desc(issueModel.updatedAt));

  if (!mostRecentPR || !mostRecentIssue) {
    return new Response('Run Init command first', { status: 400 });
  }

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

  savePRsToDB(fetchedPRs, assignableUsers);
  saveIssuesToDB(fetchedIssues, assignableUsers);

  return new Response('Data synced', {
    status: 200,
  });
}
