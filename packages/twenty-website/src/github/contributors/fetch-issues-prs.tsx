import { graphql } from '@octokit/graphql';

import {
  IssueNode,
  PullRequestNode,
  Repository,
} from '@/github/contributors/types';

// TODO: We should implement a true partial sync instead of using pageLimit.
// Check search-issues-prs.tsx and modify "updated:>2024-02-27" to make it dynamic

export async function fetchIssuesPRs(
  query: typeof graphql,
  cursor: string | null = null,
  isIssues = false,
  accumulatedData: Array<PullRequestNode | IssueNode> = [],
  pageLimit: number,
  currentPage = 0,
): Promise<Array<PullRequestNode | IssueNode>> {
  const { repository } = await query<Repository>(
    `
      query ($cursor: String) {
        repository(owner: "twentyhq", name: "twenty") {
          pullRequests(first: 30, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) @skip(if: ${isIssues}) {
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

  const newCurrentPage = currentPage + 1;

  if ((!pageLimit || newCurrentPage < pageLimit) && pageInfo.hasNextPage) {
    return fetchIssuesPRs(
      query,
      pageInfo.endCursor,
      isIssues,
      newAccumulatedData,
      pageLimit,
      currentPage + 1,
    );
  } else {
    return newAccumulatedData;
  }
}
