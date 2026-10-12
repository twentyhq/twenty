import { differenceInDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type SuspendedWorkspaceCleanupStep =
  | { operation: 'destroy' }
  | { operation: 'soft-delete' | 'warn'; daysSinceSuspended: number };

export const getSuspendedWorkspaceCleanupStep = ({
  workspace,
  isAlreadyWarned,
  inactiveDaysBeforeWarn,
  inactiveDaysBeforeSoftDelete,
}: {
  workspace: Pick<WorkspaceEntity, 'deletedAt' | 'suspendedAt'>;
  isAlreadyWarned: boolean;
  inactiveDaysBeforeWarn: number;
  inactiveDaysBeforeSoftDelete: number;
}): SuspendedWorkspaceCleanupStep | null => {
  if (isDefined(workspace.deletedAt)) {
    return { operation: 'destroy' };
  }

  if (!isDefined(workspace.suspendedAt)) {
    return null;
  }

  const daysSinceSuspended = differenceInDays(
    new Date(),
    workspace.suspendedAt,
  );

  if (daysSinceSuspended > inactiveDaysBeforeSoftDelete) {
    return { operation: 'soft-delete', daysSinceSuspended };
  }

  if (!isAlreadyWarned && daysSinceSuspended > inactiveDaysBeforeWarn) {
    return { operation: 'warn', daysSinceSuspended };
  }

  return null;
};
