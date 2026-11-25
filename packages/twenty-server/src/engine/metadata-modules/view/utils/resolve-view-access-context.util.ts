import { type ViewAccessContext } from 'src/engine/metadata-modules/view/types/view-permissions.type';

export const resolveViewAccessContext = ({
  workspace,
  userWorkspaceId,
}: {
  workspace: { id: string };
  userWorkspaceId?: string;
}): ViewAccessContext => ({
  workspaceId: workspace.id,
  userWorkspaceId,
});
