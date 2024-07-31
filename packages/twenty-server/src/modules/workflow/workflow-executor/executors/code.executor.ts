import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/workflow-executor.interface';
import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeExecutor implements WorkflowExecutor {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  async run({
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
