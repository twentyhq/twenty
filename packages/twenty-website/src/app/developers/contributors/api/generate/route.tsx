
import Database from 'better-sqlite3';
import { graphql } from '@octokit/graphql';

const db = new Database('db.sqlite', { verbose: console.log });

interface LabelNode {
	id: string;
	name: string;
	color: string;
	description: string;
  }
  
  interface AuthorNode {
	resourcePath: string;
	login: string;
	avatarUrl: string;
	url: string;
  }
  
  interface PullRequestNode {
	id: string;
	title: string;
	body: string;
	createdAt: string;
	updatedAt: string;
	closedAt: string;
	mergedAt: string;
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
  
  interface RepoData {
	repository: {
	  pullRequests: PullRequests;
	};
  }

  
const query = graphql.defaults({
  headers: {
	Authorization: 'bearer ' + process.env.GITHUB_TOKEN
  },
});


async function fetchPullRequests(cursor: string | null = null, accumulatedData: Array<PullRequestNode> = []): Promise<Array<PullRequestNode>> {
	const { repository } = await query<RepoData>(`
	  query ($cursor: String) {
		repository(owner: "twentyhq", name: "twenty") {
		  pullRequests(first: 100, after: $cursor) {
			nodes {
			  id
			  title
			  body
			  createdAt
			  updatedAt
			  closedAt
			  mergedAt
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
	`, { cursor });
  
	const newAccumulatedData : Array<PullRequestNode> = [...accumulatedData, ...repository.pullRequests.nodes];
	const pageInfo = repository.pullRequests.pageInfo;
  
	if (pageInfo.hasNextPage) {
	  return fetchPullRequests(pageInfo.endCursor, newAccumulatedData);
	} else {
	  return newAccumulatedData;
	}
  }

// Initialize the database and create tables if they don't exist
const initDb = () => {
  const db = new Database('db.sqlite', { verbose: console.log });

  const createPullRequestsTable = `
    CREATE TABLE IF NOT EXISTS pullRequests (
      id TEXT PRIMARY KEY,
      title TEXT,
      body TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      closedAt TEXT,
      mergedAt TEXT,
      authorId TEXT
    );
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT,
      avatarUrl TEXT,
      url TEXT
    );
  `;

  const createLabelsTable = `
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT,
      description TEXT,
      pullRequestId TEXT,
      FOREIGN KEY (pullRequestId) REFERENCES pullRequests(id)
    );
  `;

  db.prepare(createPullRequestsTable).run();
  db.prepare(createUsersTable).run();
  db.prepare(createLabelsTable).run();

  db.close();
};


export async function GET(request: Request) {
    const prs = await fetchPullRequests();

	initDb();

    const insertPR = db.prepare('INSERT INTO pullRequests (id, title, body, createdAt, updatedAt, closedAt, mergedAt, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING');
    const insertUser = db.prepare('INSERT INTO users (id, login, avatarUrl, url) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING');
    const insertLabel = db.prepare('INSERT INTO labels (id, name, color, description, pullRequestId) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING');

    const transaction = db.transaction(() => {
      for (const pr of prs) {
		if(pr.author == null) { continue; }
        insertPR.run(pr.id, pr.title, pr.body, pr.createdAt, pr.updatedAt, pr.closedAt, pr.mergedAt, pr.author.resourcePath);
        insertUser.run(pr.author.resourcePath, pr.author.login, pr.author.avatarUrl, pr.author.url);

        for (const label of pr.labels.nodes) {
          insertLabel.run(label.id, label.name, label.color, label.description, pr.id);
        }
      }
    });

    transaction();

    return new Response("Data synced", { status: 200 });
};
