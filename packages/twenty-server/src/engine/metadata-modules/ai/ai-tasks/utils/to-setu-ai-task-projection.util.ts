import {
  SETU_AI_TASK_TERMINAL_STATUSES,
  type SetuAiResearchBrief,
  type SetuAiTaskPendingInput,
  type SetuAiTaskProjection,
  type SetuAiTaskStepOperation,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type SetuAiTaskRunEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-run.entity';
import { type SetuAiTaskStepEntity } from 'src/engine/metadata-modules/ai/ai-tasks/entities/setu-ai-task-step.entity';

const isTaskOpen = (task: SetuAiTaskRunEntity) =>
  !SETU_AI_TASK_TERMINAL_STATUSES.includes(task.status) &&
  task.status !== 'cancel_requested';

const getStepAllowedOperations = (
  task: SetuAiTaskRunEntity,
  step: SetuAiTaskStepEntity,
): SetuAiTaskStepOperation[] => {
  if (isDefined(task.cancelRequestedAt)) {
    return [];
  }

  if (step.status === 'waiting_input') {
    return ['answer'];
  }

  return step.status === 'failed' ? ['retry'] : [];
};

export const toSetuAiTaskProjection = (
  task: SetuAiTaskRunEntity,
  steps: SetuAiTaskStepEntity[],
): SetuAiTaskProjection => ({
  schemaVersion: 1,
  id: task.id,
  kind: task.kind,
  status: task.status,
  stateVersion: task.stateVersion,
  focus: task.request.focus,
  saveBriefsAsNotes: task.request.saveBriefsAsNotes,
  allowedOperations: isTaskOpen(task) ? ['cancel'] : [],
  errorCode: task.errorCode,
  usage: { totalTokens: task.usage.totalTokens, tokenLimit: task.tokenLimit },
  steps: [...steps]
    .sort((left, right) => left.position - right.position)
    .map((step) => ({
      id: step.id,
      stepKey: step.stepKey,
      position: step.position,
      companyId: step.companyId,
      companyName: step.companyName,
      status: step.status,
      stateVersion: step.stateVersion,
      errorCode: step.errorCode,
      allowedOperations: getStepAllowedOperations(task, step),
      pendingInput:
        step.status === 'waiting_input' && isDefined(step.pendingInput)
          ? (step.pendingInput as SetuAiTaskPendingInput)
          : null,
      brief: isDefined(step.brief) ? (step.brief as SetuAiResearchBrief) : null,
      completedAt: step.completedAt?.toISOString() ?? null,
    })),
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});
