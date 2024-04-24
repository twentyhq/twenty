import {
  pgGithubStars,
  pgIssueLabels,
  pgIssues,
  pgLabels,
  pgPullRequestLabels,
  pgPullRequests,
  pgUsers,
} from '@/database/postgres/schema-postgres';
import {
  sqlLiteIssueLabels,
  sqlLiteIssues,
  sqlLiteLabels,
  sqlLitePullRequestLabels,
  sqlLitePullRequests,
  sqlLiteUsers,
} from '@/database/sqlite/schema-sqlite';

const databaseDriver = global.process.env.DATABASE_DRIVER;
const isSqliteDriver = databaseDriver === 'sqlite';

export const userModel = isSqliteDriver ? sqlLiteUsers : pgUsers;
export const pullRequestModel = isSqliteDriver
  ? sqlLitePullRequests
  : pgPullRequests;
export const issueModel = isSqliteDriver ? sqlLiteIssues : pgIssues;
export const labelModel = isSqliteDriver ? sqlLiteLabels : pgLabels;
export const pullRequestLabelModel = isSqliteDriver
  ? sqlLitePullRequestLabels
  : pgPullRequestLabels;
export const issueLabelModel = isSqliteDriver
  ? sqlLiteIssueLabels
  : pgIssueLabels;

export const githubStarsModel = pgGithubStars;

export type User = typeof pgUsers.$inferSelect;
export type PullRequest = typeof pgPullRequests.$inferSelect;
export type Issue = typeof pgIssues.$inferSelect;
export type Label = typeof pgLabels.$inferSelect;
export type PullRequestLabel = typeof pgPullRequestLabels.$inferSelect;
export type IssueLabel = typeof pgIssueLabels.$inferSelect;

export type UserInsert = typeof pgUsers.$inferInsert;
export type PullRequestInsert = typeof pgPullRequests.$inferInsert;
export type IssueInsert = typeof pgIssues.$inferInsert;
export type LabelInsert = typeof pgLabels.$inferInsert;
export type PullRequestLabelInsert = typeof pgPullRequestLabels.$inferInsert;
export type IssueLabelInsert = typeof pgIssueLabels.$inferInsert;
export type GithubStars = typeof pgGithubStars.$inferInsert;
