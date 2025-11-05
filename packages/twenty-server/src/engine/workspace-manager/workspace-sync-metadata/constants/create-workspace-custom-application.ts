import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateApplicationInput } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { v4 } from 'uuid';

export const createWorkspaceCustomApplication = ({
  workspace,
}: {
  workspace: WorkspaceEntity;
}) =>
  ({
    description: 'Workspace custom application',
    name: `${workspace.displayName ?? workspace.id}'s custom application`,
    sourcePath: 'workspace-custom',
    sourceType: 'local',
    version: '1.0.0',
    universalIdentifier: v4(),
    workspaceId: workspace.id,
  }) as const satisfies CreateApplicationInput & { workspaceId: string };
