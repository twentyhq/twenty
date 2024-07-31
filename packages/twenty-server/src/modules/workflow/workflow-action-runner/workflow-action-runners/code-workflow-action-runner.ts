import { Injectable } from '@nestjs/common';

import { WorkflowActionRunner } from 'src/modules/workflow/workflow-action-runner/workflow-action-runner.interface';
import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';

@Injectable()
export class CodeWorkflowActionRunner implements WorkflowActionRunner {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  async execute({
    action,
    workspaceId,
    payload,
  }: {
    action: WorkflowAction;
    workspaceId: string;
    payload?: object;
  }): Promise<WorkflowResult> {
    const result = await this.serverlessFunctionService.executeOne(
      action.settings.serverlessFunctionId,
      workspaceId,
      payload,
    );

    return { data: result.data, ...(result.error && { error: result.error }) };
  }
}
