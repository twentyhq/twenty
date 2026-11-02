import { type ViewAccessContext } from 'src/engine/permissions/view/types/view-permissions.type';

// Every view guard authorises the same three principals, so they read them in
// one place: a guard that builds the context by hand is how an application
// token silently lost its authorisation before.
export const resolveViewAccessContext = ({
  workspace,
  userWorkspaceId,
  apiKey,
  application,
  agentId,
}: {
  workspace: { id: string };
  userWorkspaceId?: string;
  apiKey?: { id: string };
  application?: { id: string };
  agentId?: string;
}): ViewAccessContext => ({
  workspaceId: workspace.id,
  userWorkspaceId,
  apiKeyId: apiKey?.id,
  applicationId: application?.id,
  agentId,
});
