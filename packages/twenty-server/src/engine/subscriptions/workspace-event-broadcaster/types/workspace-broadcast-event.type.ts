import { type PermissionFlagType } from 'twenty-shared/constants';

export type WorkspaceBroadcastEvent = {
  type: 'created' | 'updated' | 'deleted';
  entityName: string;
  recordId: string;
  properties: {
    updatedFields?: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
  };
  // Set for user-scoped entities so other users in the workspace don't receive them
  recipientUserWorkspaceIds?: string[];
  // Set when an entity's existence is itself gated (workflows) so the channel cannot leak it
  requiredPermissionFlag?: PermissionFlagType;
};
