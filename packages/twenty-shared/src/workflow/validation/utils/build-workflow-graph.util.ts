import { isDefined } from '@/utils';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { type ValidatableWorkflow } from '@/workflow/validation/types/workflow-validation.type';
import { getStepOutgoingStepIds } from '@/workflow/validation/utils/get-step-outgoing-step-ids.util';

export type WorkflowGraph = {
  childrenByStepId: Map<string, string[]>;
  reachableFromTrigger: Set<string>;
  ancestorsByStepId: Map<string, Set<string>>;
};

export const buildWorkflowGraph = ({
  trigger,
  steps,
}: ValidatableWorkflow): WorkflowGraph => {
  const childrenByStepId = new Map<string, string[]>();

  const triggerNextStepIds = isDefined(trigger?.nextStepIds)
    ? trigger.nextStepIds.filter(isDefined)
    : [];

  childrenByStepId.set(TRIGGER_STEP_ID, triggerNextStepIds);

  for (const step of steps ?? []) {
    childrenByStepId.set(step.id, getStepOutgoingStepIds(step));
  }

  const reachableFromTrigger = new Set<string>();
  const queue: string[] = [TRIGGER_STEP_ID];

  while (queue.length > 0) {
    const currentStepId = queue.shift();

    if (!isDefined(currentStepId) || reachableFromTrigger.has(currentStepId)) {
      continue;
    }

    reachableFromTrigger.add(currentStepId);

    for (const nextStepId of childrenByStepId.get(currentStepId) ?? []) {
      if (!reachableFromTrigger.has(nextStepId)) {
        queue.push(nextStepId);
      }
    }
  }

  const ancestorsByStepId = computeAncestors(childrenByStepId);

  return { childrenByStepId, reachableFromTrigger, ancestorsByStepId };
};

const computeAncestors = (
  childrenByStepId: Map<string, string[]>,
): Map<string, Set<string>> => {
  const parentsByStepId = new Map<string, Set<string>>();

  for (const [stepId, nextStepIds] of childrenByStepId.entries()) {
    for (const nextStepId of nextStepIds) {
      const parents = parentsByStepId.get(nextStepId) ?? new Set<string>();

      parents.add(stepId);
      parentsByStepId.set(nextStepId, parents);
    }
  }

  const ancestorsByStepId = new Map<string, Set<string>>();

  for (const stepId of childrenByStepId.keys()) {
    if (ancestorsByStepId.has(stepId)) {
      continue;
    }

    const ancestors = new Set<string>();
    const queue = [...(parentsByStepId.get(stepId) ?? [])];

    while (queue.length > 0) {
      const ancestorStepId = queue.shift()!;

      if (ancestors.has(ancestorStepId)) {
        continue;
      }

      ancestors.add(ancestorStepId);

      for (const grandParentStepId of parentsByStepId.get(ancestorStepId) ??
        []) {
        if (!ancestors.has(grandParentStepId)) {
          queue.push(grandParentStepId);
        }
      }
    }

    ancestorsByStepId.set(stepId, ancestors);
  }

  return ancestorsByStepId;
};
