import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import {
  assertEdgeConnectionOptionsAreSupported,
  buildSourceStepWithAddedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/workflow-step-connection-options.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const addEdgeToWorkflowVersionContent = ({
  trigger,
  steps,
  source,
  target,
  sourceConnectionOptions,
}: {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  source: string;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}): {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  hasChanged: boolean;
} => {
  assertEdgeConnectionOptionsAreSupported(sourceConnectionOptions);

  if (!isDefined(steps?.find((step) => step.id === target))) {
    throw new WorkflowVersionEdgeException(
      `Target step '${target}' not found`,
      WorkflowVersionEdgeExceptionCode.NOT_FOUND,
    );
  }

  if (source === TRIGGER_STEP_ID) {
    if (!isDefined(trigger)) {
      throw new WorkflowVersionEdgeException(
        'Trigger not found',
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (trigger.nextStepIds?.includes(target)) {
      return { trigger, steps, hasChanged: false };
    }

    return {
      trigger: {
        ...trigger,
        nextStepIds: [...(trigger.nextStepIds ?? []), target],
      },
      steps,
      hasChanged: true,
    };
  }

  const sourceStep = steps?.find((step) => step.id === source);

  if (!isDefined(sourceStep)) {
    throw new WorkflowVersionEdgeException(
      `Source step '${source}' not found`,
      WorkflowVersionEdgeExceptionCode.NOT_FOUND,
    );
  }

  const { updatedSourceStep, shouldPersist } = buildSourceStepWithAddedEdge({
    sourceStep,
    target,
    sourceConnectionOptions,
  });

  if (!shouldPersist) {
    return { trigger, steps, hasChanged: false };
  }

  return {
    trigger,
    steps: (steps ?? []).map((step) =>
      step.id === source ? updatedSourceStep : step,
    ),
    hasChanged: true,
  };
};
