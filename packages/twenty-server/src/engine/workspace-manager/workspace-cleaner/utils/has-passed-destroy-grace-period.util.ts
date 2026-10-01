import { differenceInDays } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const hasPassedDestroyGracePeriod = ({
  workspace,
  gracePeriodInDays,
}: {
  workspace: Pick<WorkspaceEntity, 'deletedAt'>;
  gracePeriodInDays: number;
}): boolean =>
  isDefined(workspace.deletedAt) &&
  differenceInDays(new Date(), workspace.deletedAt) > gracePeriodInDays;
