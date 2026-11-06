import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getIfElseBranchConnectionHint = (
  ifElseStep: WorkflowIfElseAction,
): string => {
  const branchIds = ifElseStep.settings.input.branches
    .map((branch) => `"${branch.id}"`)
    .join(', ');

  return `Connect If/Else step '${ifElseStep.id}' through one of its branches with connection options { connectedStepType: "IF_ELSE", settings: { branchId } }, where branchId is one of: ${branchIds}`;
};
