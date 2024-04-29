import { date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const pgUsers = pgTable('users', {
  id: text('id').primaryKey(),
  avatarUrl: text('avatarUrl'),
  url: text('url'),
  isEmployee: text('isEmployee'),
});

export const pgPullRequests = pgTable('pullRequests', {
  id: text('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  url: text('url'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
  closedAt: text('closedAt'),
  mergedAt: text('mergedAt'),
  authorId: text('authorId').references(() => pgUsers.id),
});

export const pgIssues = pgTable('issues', {
  id: text('id').primaryKey(),
  externalId: text('externalId'),
  title: text('title'),
  body: text('body'),
  url: text('url'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
  closedAt: text('closedAt'),
  authorId: text('authorId').references(() => pgUsers.id),
});

export const pgLabels = pgTable('labels', {
  id: text('id').primaryKey(),
  externalId: text('externalId'),
  name: text('name'),
  color: text('color'),
  description: text('description'),
});

export const pgPullRequestLabels = pgTable('pullRequestLabels', {
  pullRequestId: text('pullRequestExternalId').references(
    () => pgPullRequests.id,
  ),
  labelId: text('labelId').references(() => pgLabels.id),
});

export const pgIssueLabels = pgTable('issueLabels', {
  issueId: text('issueId').references(() => pgIssues.id),
  labelId: text('labelId').references(() => pgLabels.id),
});

export const pgGithubStars = pgTable('githubStars', {
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  numberOfStars: integer('numberOfStars'),
});

export const pgGithubReleasesModel = pgTable('githubReleases', {
  tagName: text('tagName').primaryKey(),
  publishedAt: date('publishedAt', { mode: 'string' }).notNull(),
});
