import { insertMany } from '@/database/database';
import {
  issueLabelModel,
  issueModel,
  labelModel,
  userModel,
} from '@/database/model';
import { IssueNode } from '@/github/contributors/types';

export async function saveIssuesToDB(
  issues: Array<IssueNode>,
  assignableUsers: Set<string>,
) {
  for (const issue of issues) {
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
      {
        onConflictKey: 'id',
        onConflictUpdateObject: {
          avatarUrl: issue.author.avatarUrl,
          url: issue.author.url,
          isEmployee: assignableUsers.has(issue.author.login) ? '1' : '0',
        },
      },
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
      {
        onConflictKey: 'id',
        onConflictUpdateObject: {
          title: issue.title,
          body: issue.body,
          url: issue.url,
          updatedAt: issue.updatedAt,
          closedAt: issue.closedAt,
          authorId: issue.author.login,
        },
      },
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
        {
          onConflictKey: 'id',
          onConflictUpdateObject: {
            name: label.name,
            color: label.color,
            description: label.description,
          },
        },
      );
      await insertMany(
        issueLabelModel,
        [
          {
            issueId: issue.id,
            labelId: label.id,
          },
        ],
        {
          onConflictDoNothing: true,
        },
      );
    }
  }
}
