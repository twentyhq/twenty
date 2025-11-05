import { v4 } from 'uuid';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CreateApplicationInput } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

export const computeWorkspaceCustomCreateApplicationInput = ({
  workspace,
}: {
  workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
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
