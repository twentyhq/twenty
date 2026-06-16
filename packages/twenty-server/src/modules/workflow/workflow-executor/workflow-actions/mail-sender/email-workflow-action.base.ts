import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IsNull, type Repository } from 'typeorm';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import {
  buildEmailStepLog,
  type EmailStepLogMode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/build-email-step-log.util';
import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';
import { ToolBackedWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/tool-backed/tool-backed.workflow-action';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export abstract class EmailWorkflowActionBase extends ToolBackedWorkflowAction<WorkflowSendEmailActionInput> {
  protected constructor(
    loggerName: string,
    workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {
    super(loggerName, workflowRunStepLogService);
  }

  protected abstract getMode(): EmailStepLogMode;

  protected override async preprocessInput(
    rawInput: WorkflowSendEmailActionInput,
    context: Record<string, unknown>,
  ): Promise<WorkflowSendEmailActionInput> {
    if (!isDefined(rawInput.body)) {
      return rawInput;
    }

    const renderedBody = await resolveEmailBody(rawInput.body, context);

    return { ...rawInput, body: renderedBody };
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

  // The sender configured on an email step is either a connected account id
  // (static pick) or a workspace member id (from a resolved workflow variable).
  // When it is a workspace member id, resolve that member's first connected
  // account; otherwise return it unchanged so the regular connected account
  // flow applies. Only meaningful inside workflow email actions.
  protected async resolveSenderConnectedAccountId(
    senderId: string,
    workspaceId: string,
  ): Promise<string> {
    if (!isValidUuid(senderId)) {
      return senderId;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMember = await this.findWorkspaceMemberById(
          senderId,
          workspaceId,
        );

        if (!isDefined(workspaceMember)) {
          return senderId;
        }

        const connectedAccountId =
          await this.findFirstConnectedAccountIdByWorkspaceMember(
            workspaceMember,
            workspaceId,
          );

        if (!isDefined(connectedAccountId)) {
          throw new WorkflowStepExecutorException(
            `No connected account found for workspace member '${senderId}'`,
            WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
          );
        }

        return connectedAccountId;
      },
      authContext,
    );
  }

  private async findWorkspaceMemberById(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity | null> {
    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return workspaceMemberRepository.findOne({
      where: { id: workspaceMemberId },
    });
  }

  private async findFirstConnectedAccountIdByWorkspaceMember(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceId: string,
  ): Promise<string | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      return null;
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        userWorkspaceId: userWorkspace.id,
        workspaceId,
        archivedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });

    return connectedAccount?.id ?? null;
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
