import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { AiEvaluationService } from 'src/engine/metadata-modules/ai/ai-evaluation/services/ai-evaluation.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowClassifyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/guards/is-workflow-classify-action.guard';
import { type WorkflowClassifyActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/types/workflow-classify-action-input.type';
import { buildEvaluationQuestions } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/utils/build-evaluation-questions.util';

@Injectable()
export class ClassifyWorkflowAction implements WorkflowAction {
  constructor(
    private readonly aiEvaluationService: AiEvaluationService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowClassifyAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a classify action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { modelId, state, questions, allowLanguageModelFallback } =
      resolveInput(step.settings.input, context) as WorkflowClassifyActionInput;

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const {
      answers,
      modelId: resolvedModelId,
      runnerKind,
    } = await this.aiEvaluationService.evaluate({
      workspaceId: runInfo.workspaceId,
      userWorkspaceId,
      modelId,
      allowLanguageModelFallback,
      state,
      questions: buildEvaluationQuestions(questions),
    });

    return {
      result: {
        answers,
        modelId: resolvedModelId,
        // Surfaced in the step output so a downstream branch can tell a
        // calibrated probability from one a language model made up.
        runnerKind,
      },
    };
  }
}
