import { isDefined } from 'twenty-shared/utils';

import {
  type WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import {
  type WorkflowTrigger,
  type WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type PublishedCoreTriggerTarget =
  | ({
      status: 'RESOLVED';
      workflowId: string;
      legacyWorkflowId?: string;
      definition: WorkflowTrigger;
    } & CoreDispatchIds)
  | { status: 'UNRESOLVABLE'; reason: string }
  | { status: 'NOT_APPLICABLE' };

export const resolvePublishedCoreTriggerTarget = ({
  workflow,
  publishedVersion,
  expectedTriggerType,
}: {
  workflow: Pick<
    WorkflowEntity,
    'id' | 'workspaceWorkflowId' | 'lastPublishedCoreWorkflowVersionId'
  > | null;
  publishedVersion:
    | (Pick<
        WorkflowVersionEntity,
        'id' | 'coreWorkflowId' | 'status' | 'workspaceWorkflowVersionId'
      > & { triggers: WorkflowTrigger[] | null })
    | null;
  expectedTriggerType: WorkflowTriggerType;
}): PublishedCoreTriggerTarget => {
  if (!isDefined(workflow)) {
    return { status: 'UNRESOLVABLE', reason: 'workflow-not-found' };
  }

  if (!isDefined(workflow.lastPublishedCoreWorkflowVersionId)) {
    return { status: 'UNRESOLVABLE', reason: 'no-published-version' };
  }

  if (!isDefined(publishedVersion)) {
    return { status: 'UNRESOLVABLE', reason: 'published-version-not-found' };
  }

  const definition = publishedVersion.triggers?.[0];

  if (
    publishedVersion.coreWorkflowId !== workflow.id ||
    publishedVersion.status !== WorkflowVersionStatus.ACTIVE ||
    definition?.type !== expectedTriggerType
  ) {
    return { status: 'NOT_APPLICABLE' };
  }

  return {
    status: 'RESOLVED',
    workflowId: workflow.id,
    legacyWorkflowId: workflow.workspaceWorkflowId ?? undefined,
    definition,
    ...buildCoreDispatchIds({
      coreWorkflowVersionId: publishedVersion.id,
      workspaceWorkflowVersionId: publishedVersion.workspaceWorkflowVersionId,
    }),
  };
};
