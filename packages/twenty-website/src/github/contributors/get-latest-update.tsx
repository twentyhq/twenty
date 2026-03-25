import { desc } from 'drizzle-orm';

import { findOne } from '@/database/database';
import { issueModel, pullRequestModel } from '@/database/model';

export async function getLatestUpdate() {
  const latestPR = await findOne(
    pullRequestModel,
    desc(pullRequestModel.updatedAt),
  );
  const latestIssue = await findOne(issueModel, desc(issueModel.updatedAt));
  const prDate = latestPR[0]
    ? new Date(latestPR[0].updatedAt)
    : new Date('2023-01-01');
  const issueDate = latestIssue[0]
    ? new Date(latestIssue[0].updatedAt)
    : new Date('2023-01-01');
  return (prDate > issueDate ? prDate : issueDate).toISOString();
}
