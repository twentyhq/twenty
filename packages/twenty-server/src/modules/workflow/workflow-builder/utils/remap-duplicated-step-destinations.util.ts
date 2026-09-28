import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const remapIds = (
  stepIds: string[] | undefined,
  clonedStepIdBySourceStepId: Map<string, string>,
): string[] =>
  (stepIds ?? []).map(
    (stepId) => clonedStepIdBySourceStepId.get(stepId) ?? stepId,
  );

export const remapDuplicatedStepDestinations = <
  TTrigger extends WorkflowTrigger,
>({
  trigger,
  sourceToClonedPairs,
  clonedStepIdBySourceStepId,
}: {
  trigger: TTrigger;
  sourceToClonedPairs: { source: WorkflowAction; duplicated: WorkflowAction }[];
  clonedStepIdBySourceStepId: Map<string, string>;
}): { trigger: TTrigger; steps: WorkflowAction[] } => ({
  trigger: {
    ...trigger,
    nextStepIds: remapIds(trigger.nextStepIds, clonedStepIdBySourceStepId),
  },
  steps: sourceToClonedPairs.map(({ source, duplicated }) => {
    const remappedStep: WorkflowAction = {
      ...duplicated,
      nextStepIds: remapIds(source.nextStepIds, clonedStepIdBySourceStepId),
    };

    if (
      source.type === WorkflowActionType.ITERATOR &&
      remappedStep.type === WorkflowActionType.ITERATOR &&
      isDefined(source.settings.input.initialLoopStepIds)
    ) {
      remappedStep.settings = {
        ...remappedStep.settings,
        input: {
          ...remappedStep.settings.input,
          initialLoopStepIds: remapIds(
            source.settings.input.initialLoopStepIds,
            clonedStepIdBySourceStepId,
          ),
        },
      };
    }

    if (
      source.type === WorkflowActionType.IF_ELSE &&
      remappedStep.type === WorkflowActionType.IF_ELSE &&
      isDefined(source.settings.input.branches)
    ) {
      remappedStep.settings = {
        ...remappedStep.settings,
        input: {
          ...remappedStep.settings.input,
          branches: source.settings.input.branches.map((branch) => ({
            ...branch,
            nextStepIds: remapIds(
              branch.nextStepIds,
              clonedStepIdBySourceStepId,
            ),
          })),
        },
      };
    }

    return remappedStep;
  }),
});
