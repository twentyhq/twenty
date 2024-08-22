import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import { WorkflowCodeStep } from 'src/modules/workflow/common/types/workflow-step.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.exception';
import { WorkflowStepExecutor } from 'src/modules/workflow/workflow-step-executor/workflow-step-executor.interface';

@Injectable()
export class CodeActionExecutor implements WorkflowStepExecutor {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    step,
    payload,
  }: {
    step: WorkflowCodeStep;
    payload?: object;
  }): Promise<WorkflowResult> {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const result = await this.serverlessFunctionService.executeOne(
      step.settings.serverlessFunctionId,
      workspaceId,
      payload,
    );

    return { data: result.data, ...(result.error && { error: result.error }) };
  }
}
