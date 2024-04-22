import { insertMany } from '@/database/database';
import {
  labelModel,
  pullRequestLabelModel,
  pullRequestModel,
  userModel,
} from '@/database/model';
import { PullRequestNode } from '@/github-sync/contributors/types';

export async function savePRsToDB(
  prs: Array<PullRequestNode>,
  assignableUsers: Set<string>,
) {
  for (const pr of prs) {
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
      { onConflictKey: 'id', onConflictUpdateObject: { title: pr.title } },
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
}
