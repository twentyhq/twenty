import {
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

export type User = typeof sqlLiteUsers.$inferSelect;
export type PullRequest = typeof sqlLitePullRequests.$inferSelect;
export type Issue = typeof sqlLiteIssues.$inferSelect;
export type Label = typeof sqlLiteLabels.$inferSelect;
export type PullRequestLabel = typeof sqlLitePullRequestLabels.$inferSelect;
export type IssueLabel = typeof sqlLiteIssueLabels.$inferSelect;

export type UserInsert = typeof sqlLiteUsers.$inferInsert;
export type PullRequestInsert = typeof sqlLitePullRequests.$inferInsert;
export type IssueInsert = typeof sqlLiteIssues.$inferInsert;
export type LabelInsert = typeof sqlLiteLabels.$inferInsert;
export type PullRequestLabelInsert =
  typeof sqlLitePullRequestLabels.$inferInsert;
export type IssueLabelInsert = typeof sqlLiteIssueLabels.$inferInsert;
