import { type graphql } from '@octokit/graphql';

import {
  type IssueNode,
  type PullRequestNode,
  type Repository,
} from '@/github/contributors/types';

export async function fetchIssuesPRs(
  query: typeof graphql,
  cursor: string | null = null,
  isIssues = false,
  accumulatedData: Array<PullRequestNode | IssueNode> = [],
): Promise<Array<PullRequestNode | IssueNode>> {
  const { repository } = await query<Repository>(
    `
      query ($cursor: String) {
        repository(owner: "twentyhq", name: "twenty") {
          pullRequests(first: 100, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) @skip(if: ${isIssues}) {
            nodes {
              id
              title
              body
              url
              createdAt
              updatedAt
              closedAt
              mergedAt
              author {
                resourcePath
                login
                avatarUrl(size: 460)
                url
              }
              labels(first: 100) {
                nodes {
                  id
                  name
                  color
                  description
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          issues(first: 100, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) @skip(if: ${!isIssues}) {
            nodes {
              id
              title
              body
              url
              createdAt
              updatedAt
              closedAt
              author {
                resourcePath
                login
                avatarUrl
                url
              }
              labels(first: 100) {
                nodes {
                  id
                  name
                  color
                  description
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `,
    { cursor },
  );

  const newAccumulatedData: Array<PullRequestNode | IssueNode> = [
    ...accumulatedData,
    ...(isIssues ? repository.issues.nodes : repository.pullRequests.nodes),
  ];
  const pageInfo = isIssues
    ? repository.issues.pageInfo
    : repository.pullRequests.pageInfo;

  if (pageInfo.hasNextPage) {
    return fetchIssuesPRs(
      query,
      pageInfo.endCursor,
      isIssues,
      newAccumulatedData,
    );
  } else {
    return newAccumulatedData;
  }
}
