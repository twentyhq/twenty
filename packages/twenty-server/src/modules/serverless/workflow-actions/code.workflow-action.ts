import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowCodeStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

@Injectable()
export class CodeWorkflowAction {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    step,
    context,
  }: {
    step: WorkflowCodeStep;
    context?: Record<string, any>;
  }): Promise<WorkflowActionResult> {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const result =
      await this.serverlessFunctionService.executeOneServerlessFunction(
        step.settings.input.serverlessFunctionId,
        workspaceId,
        context || {},
      );

    if (result.error) {
      return { error: result.error };
    }

    return { result: result.data || {} };
  }
}
