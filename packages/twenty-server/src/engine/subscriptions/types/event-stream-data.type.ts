import { type RecordGqlOperationSignature } from 'twenty-shared/types';

export type EventStreamData = {
  userId: string;
  userWorkspaceId: string;
  workspaceId: string;
  queries: Record<string, RecordGqlOperationSignature>;
  createdAt: number;
};
