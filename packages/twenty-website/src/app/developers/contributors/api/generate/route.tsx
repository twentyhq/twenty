import { graphql } from '@octokit/graphql';
import Database from 'better-sqlite3';

const db = new Database('db.sqlite', { verbose: console.log });

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
    Authorization: 'bearer ' + process.env.GITHUB_TOKEN,
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

const initDb = () => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS pullRequests (
      id TEXT PRIMARY KEY,
      title TEXT,
      body TEXT,
	  url TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      closedAt TEXT,
      mergedAt TEXT,
      authorId TEXT,
      FOREIGN KEY (authorId) REFERENCES users(id)
    );
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT,
      body TEXT,
      url TEXT,
	  createdAt TEXT,
      updatedAt TEXT,
      closedAt TEXT,
      authorId TEXT,
      FOREIGN KEY (authorId) REFERENCES users(id)
    );
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT,
      avatarUrl TEXT,
      url TEXT,
      isEmployee BOOLEAN
    );
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT,
      description TEXT
    );
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS pullRequestLabels (
      pullRequestId TEXT,
      labelId TEXT,
      FOREIGN KEY (pullRequestId) REFERENCES pullRequests(id),
      FOREIGN KEY (labelId) REFERENCES labels(id)
    );
  `,
  ).run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS issueLabels (
      issueId TEXT,
      labelId TEXT,
      FOREIGN KEY (issueId) REFERENCES issues(id),
      FOREIGN KEY (labelId) REFERENCES labels(id)
    );
  `,
  ).run();
};

export async function GET() {
  initDb();

  // TODO if we ever hit API Rate Limiting
  const lastPRCursor = null;
  const lastIssueCursor = null;

  const assignableUsers = await fetchAssignableUsers();
  const prs = (await fetchData(lastPRCursor)) as Array<PullRequestNode>;
  const issues = (await fetchData(lastIssueCursor, true)) as Array<IssueNode>;

  const insertPR = db.prepare(
    'INSERT INTO pullRequests (id, title, body, url, createdAt, updatedAt, closedAt, mergedAt, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING',
  );
  const insertIssue = db.prepare(
    'INSERT INTO issues (id, title, body, url, createdAt, updatedAt, closedAt, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING',
  );
  const insertUser = db.prepare(
    'INSERT INTO users (id, login, avatarUrl, url, isEmployee) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING',
  );
  const insertLabel = db.prepare(
    'INSERT INTO labels (id, name, color, description) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING',
  );
  const insertPullRequestLabel = db.prepare(
    'INSERT INTO pullRequestLabels (pullRequestId, labelId) VALUES (?, ?)',
  );
  const insertIssueLabel = db.prepare(
    'INSERT INTO issueLabels (issueId, labelId) VALUES (?, ?)',
  );

  for (const pr of prs) {
    console.log(pr);
    if (pr.author == null) {
      continue;
    }
    insertUser.run(
      pr.author.resourcePath,
      pr.author.login,
      pr.author.avatarUrl,
      pr.author.url,
      assignableUsers.has(pr.author.login) ? 1 : 0,
    );
    insertPR.run(
      pr.id,
      pr.title,
      pr.body,
      pr.url,
      pr.createdAt,
      pr.updatedAt,
      pr.closedAt,
      pr.mergedAt,
      pr.author.resourcePath,
    );

    for (const label of pr.labels.nodes) {
      insertLabel.run(label.id, label.name, label.color, label.description);
      insertPullRequestLabel.run(pr.id, label.id);
    }
  }

  for (const issue of issues) {
    if (issue.author == null) {
      continue;
    }
    insertUser.run(
      issue.author.resourcePath,
      issue.author.login,
      issue.author.avatarUrl,
      issue.author.url,
      assignableUsers.has(issue.author.login) ? 1 : 0,
    );

    insertIssue.run(
      issue.id,
      issue.title,
      issue.body,
      issue.url,
      issue.createdAt,
      issue.updatedAt,
      issue.closedAt,
      issue.author.resourcePath,
    );

    for (const label of issue.labels.nodes) {
      insertLabel.run(label.id, label.name, label.color, label.description);
      insertIssueLabel.run(issue.id, label.id);
    }
  }

  db.close();

  return new Response('Data synced', { status: 200 });
}
