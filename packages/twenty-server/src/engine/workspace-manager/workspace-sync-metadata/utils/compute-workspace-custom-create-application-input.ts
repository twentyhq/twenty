import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CreateApplicationInput } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';
import { v4 } from 'uuid';

export const computeWorkspaceCustomCreateApplicationInput = ({
  workspace,
  applicationId = v4(),
}: {
  applicationId?: string;
  workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
}) =>
  ({
    description: 'Workspace custom application',
    name: `${isDefined(workspace.displayName) ? `${workspace.displayName}'s ` : ''}custom application`,
    sourcePath: 'workspace-custom',
    sourceType: 'local',
    version: '1.0.0',
    universalIdentifier: applicationId,
    workspaceId: workspace.id,
    id: applicationId,
  }) as const satisfies CreateApplicationInput & {
    workspaceId: string;
    id: string;
  };
