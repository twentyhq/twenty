export interface LabelNode {
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

export interface PullRequestNode {
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

export interface IssueNode {
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

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface PullRequests {
  nodes: PullRequestNode[];
  pageInfo: PageInfo;
}

export interface Issues {
  nodes: IssueNode[];
  pageInfo: PageInfo;
}

export interface AssignableUserNode {
  login: string;
}

export interface AssignableUsers {
  nodes: AssignableUserNode[];
}

export interface Stargazers {
  totalCount: number;
}

export interface Repository {
  repository: {
    pullRequests: PullRequests;
    issues: Issues;
    assignableUsers: AssignableUsers;
    stargazers: Stargazers;
  };
}

export interface SearchEdgeNode {
  node: IssueNode | PullRequestNode;
}

export interface SearchEdges {
  edges: SearchEdgeNode[];
  pageInfo: PageInfo;
}

export interface SearchIssuesPRsQuery {
  search: SearchEdges;
}
