import {
  pgGithubReleasesModel,
  pgGithubStars,
  pgIssueLabels,
  pgIssues,
  pgLabels,
  pgPullRequestLabels,
  pgPullRequests,
  pgUsers,
} from '@/database/schema-postgres';

export const userModel = pgUsers;
export const pullRequestModel = pgPullRequests;
export const issueModel = pgIssues;
export const labelModel = pgLabels;
export const pullRequestLabelModel = pgPullRequestLabels;
export const issueLabelModel = pgIssueLabels;

export const githubStarsModel = pgGithubStars;
export const githubReleasesModel = pgGithubReleasesModel;

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
export type GithubReleases = typeof pgGithubReleasesModel.$inferInsert;
