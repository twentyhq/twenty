import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sqlLiteUsers = sqliteTable('users', {
  id: text('id').primaryKey(),
  avatarUrl: text('avatarUrl'),
  url: text('url'),
  isEmployee: text('isEmployee'),
});

export const sqlLitePullRequests = sqliteTable('pullRequests', {
  id: text('id').primaryKey(),
  title: text('title'),
  body: text('body'),
  url: text('url'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
  closedAt: text('closedAt'),
  mergedAt: text('mergedAt'),
  authorId: text('authorId').references(() => sqlLiteUsers.id),
});

export const sqlLiteIssues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  externalId: text('externalId'),
  title: text('title'),
  body: text('body'),
  url: text('url'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
  closedAt: text('closedAt'),
  authorId: text('authorId').references(() => sqlLiteUsers.id),
});

export const sqlLiteLabels = sqliteTable('labels', {
  id: text('id').primaryKey(),
  externalId: text('externalId'),
  name: text('name'),
  color: text('color'),
  description: text('description'),
});

export const sqlLitePullRequestLabels = sqliteTable('pullRequestLabels', {
  pullRequestId: text('pullRequestExternalId').references(
    () => sqlLitePullRequests.id,
  ),
  labelId: text('labelId').references(() => sqlLiteLabels.id),
});

export const sqlLiteIssueLabels = sqliteTable('issueLabels', {
  issueId: text('issueId').references(() => sqlLiteIssues.id),
  labelId: text('labelId').references(() => sqlLiteLabels.id),
});
