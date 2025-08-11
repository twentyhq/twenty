import { type graphql } from '@octokit/graphql';

import { getLatestUpdate } from '@/github/contributors/get-latest-update';
import {
  type IssueNode,
  type PullRequestNode,
  type SearchIssuesPRsQuery,
} from '@/github/contributors/types';

export async function searchIssuesPRs(
  query: typeof graphql,
  cursor: string | null = null,
  isIssues = false,
  accumulatedData: Array<PullRequestNode | IssueNode> = [],
): Promise<Array<PullRequestNode | IssueNode>> {
  const since = await getLatestUpdate();
  const { search } = await query<SearchIssuesPRsQuery>(
    `
        query searchPullRequestsAndIssues($cursor: String) {
          search(query: "repo:twentyhq/twenty ${
            isIssues ? 'is:issue' : 'is:pr'
          } updated:>${since}", type: ISSUE, first: 100, after: $cursor) {
            edges {
              node {
                ... on PullRequest {
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
                ... on Issue {
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
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        `,
    {
      cursor,
    },
  );

  const newAccumulatedData: Array<PullRequestNode | IssueNode> = [
    ...accumulatedData,
    ...search.edges.map(({ node }) => node),
  ];
  const pageInfo = search.pageInfo;

  if (pageInfo.hasNextPage) {
    return searchIssuesPRs(
      query,
      pageInfo.endCursor,
      isIssues,
      newAccumulatedData,
    );
  } else {
    return newAccumulatedData;
  }
}
