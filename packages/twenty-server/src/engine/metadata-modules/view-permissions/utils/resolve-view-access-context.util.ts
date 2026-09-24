import { type ViewAccessContext } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';

// Every view guard authorises the same three principals, so they read them in
// one place: a guard that builds the context by hand is how an application
// token silently lost its authorisation before.
export const resolveViewAccessContext = ({
  workspace,
  userWorkspaceId,
  apiKey,
  application,
}: {
  workspace: { id: string };
  userWorkspaceId?: string;
  apiKey?: { id: string };
  application?: { id: string };
}): ViewAccessContext => ({
  workspaceId: workspace.id,
  userWorkspaceId,
  apiKeyId: apiKey?.id,
  applicationId: application?.id,
});
