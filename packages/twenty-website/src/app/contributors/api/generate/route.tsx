export const dynamic = 'force-dynamic';

import { global } from '@apollo/client/utilities/globals';
import { graphql } from '@octokit/graphql';

import { insertMany, migrate } from '@/database/database';
import {
  issueLabelModel,
  issueModel,
  labelModel,
  pullRequestLabelModel,
  pullRequestModel,
  userModel,
} from '@/database/model';

interface LabelNode {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface AuthorNode {
  resourcePath: string;
  login: string;
  avatarUrl: string;
  url: string;
}

interface PullRequestNode {
  id: string;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  mergedAt: string;
  author: AuthorNode;
  labels: {
    nodes: LabelNode[];
  };
}

interface IssueNode {
  id: string;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  author: AuthorNode;
  labels: {
    nodes: LabelNode[];
  };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface PullRequests {
  nodes: PullRequestNode[];
  pageInfo: PageInfo;
}

interface Issues {
  nodes: IssueNode[];
  pageInfo: PageInfo;
}

interface AssignableUserNode {
  login: string;
}

interface AssignableUsers {
  nodes: AssignableUserNode[];
}

interface RepoData {
  repository: {
    pullRequests: PullRequests;
    issues: Issues;
    assignableUsers: AssignableUsers;
  };
}

const query = graphql.defaults({
  headers: {
    Authorization: 'bearer ' + global.process.env.GITHUB_TOKEN,
  },
});

async function fetchData(
  cursor: string | null = null,
  isIssues: boolean = false,
  accumulatedData: Array<PullRequestNode | IssueNode> = [],
): Promise<Array<PullRequestNode | IssueNode>> {
  const { repository } = await query<RepoData>(
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
    return fetchData(pageInfo.endCursor, isIssues, newAccumulatedData);
  } else {
    return newAccumulatedData;
  }
}

async function fetchAssignableUsers(): Promise<Set<string>> {
  const { repository } = await query<RepoData>(`
    query {
      repository(owner: "twentyhq", name: "twenty") {
        assignableUsers(first: 100) {
          nodes {
            login
          }
        }
      }
    }
  `);

  return new Set(repository.assignableUsers.nodes.map((user) => user.login));
}

export async function GET() {
  if (!global.process.env.GITHUB_TOKEN) {
    return new Response('No GitHub token provided', { status: 500 });
  }

  await migrate();

  // TODO if we ever hit API Rate Limiting
  const lastPRCursor = null;
  const lastIssueCursor = null;

  const assignableUsers = await fetchAssignableUsers();
  const fetchedPRs = (await fetchData(lastPRCursor)) as Array<PullRequestNode>;
  const fetchedIssues = (await fetchData(
    lastIssueCursor,
    true,
  )) as Array<IssueNode>;

  for (const pr of fetchedPRs) {
    if (pr.author == null) {
      continue;
    }
    await insertMany(
      userModel,
      [
        {
          id: pr.author.login,
          avatarUrl: pr.author.avatarUrl,
          url: pr.author.url,
          isEmployee: assignableUsers.has(pr.author.login) ? '1' : '0',
        },
      ],
      { onConflictKey: 'id' },
    );

    await insertMany(
      pullRequestModel,
      [
        {
          id: pr.id,
          title: pr.title,
          body: pr.body,
          url: pr.url,
          createdAt: pr.createdAt,
          updatedAt: pr.updatedAt,
          closedAt: pr.closedAt,
          mergedAt: pr.mergedAt,
          authorId: pr.author.login,
        },
      ],
      { onConflictKey: 'id' },
    );

    for (const label of pr.labels.nodes) {
      await insertMany(
        labelModel,
        [
          {
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description,
          },
        ],
        { onConflictKey: 'id' },
      );
      await insertMany(pullRequestLabelModel, [
        {
          pullRequestId: pr.id,
          labelId: label.id,
        },
      ]);
    }
  }

  for (const issue of fetchedIssues) {
    if (issue.author == null) {
      continue;
    }
    await insertMany(
      userModel,
      [
        {
          id: issue.author.login,
          avatarUrl: issue.author.avatarUrl,
          url: issue.author.url,
          isEmployee: assignableUsers.has(issue.author.login) ? '1' : '0',
        },
      ],
      { onConflictKey: 'id' },
    );

    await insertMany(
      issueModel,
      [
        {
          id: issue.id,
          title: issue.title,
          body: issue.body,
          url: issue.url,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          closedAt: issue.closedAt,
          authorId: issue.author.login,
        },
      ],
      { onConflictKey: 'id' },
    );

    for (const label of issue.labels.nodes) {
      await insertMany(
        labelModel,
        [
          {
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description,
          },
        ],
        { onConflictKey: 'id' },
      );
      await insertMany(issueLabelModel, [
        {
          pullRequestId: issue.id,
          labelId: label.id,
        },
      ]);
    }
  }

  return new Response('Data synced', {
    status: 200,
  });
}
