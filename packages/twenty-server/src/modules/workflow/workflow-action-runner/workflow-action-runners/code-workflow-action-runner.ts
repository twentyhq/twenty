import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import {
  WorkflowActionRunnerException,
  WorkflowActionRunnerExceptionCode,
} from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.exception';
import { WorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.interface';

@Injectable()
export class CodeWorkflowActionRunner implements WorkflowActionRunner {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    action,
    payload,
  }: {
    action: WorkflowAction;
    payload?: object;
  }): Promise<WorkflowResult> {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowActionRunnerException(
        'Scoped workspace not found',
        WorkflowActionRunnerExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const result = await this.serverlessFunctionService.executeOne(
      action.settings.serverlessFunctionId,
      workspaceId,
      payload,
    );

    return { data: result.data, ...(result.error && { error: result.error }) };
  }
}
