import { desc } from 'drizzle-orm';

import { findOne } from '@/database/database';
import { issueModel, pullRequestModel } from '@/database/model';

export async function getLatestUpdate() {
  const latestPR = await findOne(
    pullRequestModel,
    desc(pullRequestModel.updatedAt),
  );
  const latestIssue = await findOne(issueModel, desc(issueModel.updatedAt));
  const prDate = new Date(latestPR[0].updatedAt);
  const issueDate = new Date(latestIssue[0].updatedAt);
  return (prDate > issueDate ? prDate : issueDate).toISOString();
}
