import { type ConnectedAccountOperation } from 'twenty-shared/types';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import {
  isDefined,
  isValidUuid,
  resolveInput as resolveWorkflowInput,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountAccessService } from 'src/engine/metadata-modules/connected-account/connected-account-access.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { buildEmailStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';
import { resolveEmailFiles } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-files.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export abstract class EmailWorkflowActionBase extends ToolBackedWorkflowAction<WorkflowSendEmailActionInput> {
  protected constructor(
    loggerName: string,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly connectedAccountAccessService: ConnectedAccountAccessService,
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
  ) {
    super(loggerName, workflowRunStepLogService);
  }

  protected abstract getMode(): ConnectedAccountOperation;

  protected override async preprocessInput(
    rawInput: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): Promise<WorkflowSendEmailActionInput> {
    const files = resolveEmailFiles(rawInput.files, context);

    const body = isDefined(rawInput.body)
      ? await resolveEmailBody(rawInput.body, context)
      : rawInput.body;

    return { ...rawInput, body, files };
  }

  protected override resolveInput(
    input: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): WorkflowSendEmailActionInput {
    const { body, ...inputWithoutBody } = input;

    return {
      ...(resolveWorkflowInput(
        inputWithoutBody,
        context,
      ) as typeof inputWithoutBody),
      body,
    };
  }

  protected override async buildToolExecutionContext(
    runInfo: WorkflowRunInfo,
  ): Promise<ToolExecutionContext> {
    const authContext =
      await this.workflowExecutionContextService.getWorkflowApplicationAuthContext(
        runInfo,
      );

    return { workspaceId: runInfo.workspaceId, authContext };
  }

  protected override async postprocessInput(
    resolvedInput: WorkflowSendEmailActionInput,
    workspaceId: string,
  ): Promise<WorkflowSendEmailActionInput> {
    if (!isDefined(resolvedInput.connectedAccountId)) {
      return resolvedInput;
    }

    const connectedAccountId = await this.resolveSenderConnectedAccountId(
      resolvedInput.connectedAccountId,
      workspaceId,
    );

    return { ...resolvedInput, connectedAccountId };
  }

  protected async resolveSenderConnectedAccountId(
    senderId: string,
    workspaceId: string,
  ): Promise<string> {
    if (!isValidUuid(senderId)) {
      return senderId;
    }

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({ where: { id: senderId } }),
        buildSystemAuthContext(workspaceId),
      );

    if (!isDefined(workspaceMember)) {
      return senderId;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    const connectedAccount = isDefined(userWorkspace)
      ? await this.connectedAccountAccessService.findFirstOwnedConnectedAccount(
          {
            workspaceId,
            userWorkspaceId: userWorkspace.id,
            operation: this.getMode(),
          },
        )
      : undefined;

    if (!isDefined(connectedAccount)) {
      throw new WorkflowStepExecutorException(
        `Workspace member '${senderId}' has no connected account that can perform ${this.getMode()}`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    return connectedAccount.id;
  }

  protected buildStepLog({
    input,
    output,
    durationMs,
  }: {
    input: WorkflowSendEmailActionInput;
    output: ToolOutput;
    durationMs: number;
  }): WorkflowRunStepLog {
    return buildEmailStepLog({
      mode: this.getMode(),
      input,
      output,
      durationMs,
    });
  }
}
