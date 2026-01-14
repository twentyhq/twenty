import { type RecordGqlOperationSignature } from 'twenty-shared/types';

import { type SerializableAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export type EventStreamData = {
  authContext: SerializableAuthContext;
  workspaceId: string;
  queries: Record<string, RecordGqlOperationSignature>;
  createdAt: number;
};
