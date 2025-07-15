import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import {
  SendEmailActionException,
  SendEmailActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/exceptions/send-email-action.exception';
import { isWorkflowSendEmailAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/guards/is-workflow-send-email-action.guard';
import { WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';

export type WorkflowSendEmailStepOutputSchema = {
  success: boolean;
};

@Injectable()
export class SendEmailWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly sendMessageService: MessagingSendMessageService,
  ) {}

  private async getConnectedAccount(connectedAccountId: string) {
    if (!isValidUuid(connectedAccountId)) {
      throw new SendEmailActionException(
        `Connected Account ID is not a valid UUID`,
        SendEmailActionExceptionCode.INVALID_CONNECTED_ACCOUNT_ID,
      );
    }

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );
    const connectedAccount = await connectedAccountRepository.findOneBy({
      id: connectedAccountId,
    });

    if (!isDefined(connectedAccount)) {
      throw new SendEmailActionException(
        `Connected Account '${connectedAccountId}' not found`,
        SendEmailActionExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    return connectedAccount;
  }

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowSendEmailAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send email action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const connectedAccount = await this.getConnectedAccount(
      step.settings.input.connectedAccountId,
    );

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowSendEmailActionInput;

    const { email, body, subject } = workflowActionInput;

    const emailSchema = z.string().trim().email('Invalid email');

    const result = emailSchema.safeParse(email);

    if (!result.success) {
      throw new SendEmailActionException(
        `Email '${email}' invalid`,
        SendEmailActionExceptionCode.INVALID_EMAIL,
      );
    }

    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const safeBody = purify.sanitize(body || '');
    const safeSubject = purify.sanitize(subject || '');

    await this.sendMessageService.sendMessage(
      {
        to: email,
        subject: safeSubject,
        body: safeBody,
      },
      connectedAccount,
    );

    this.logger.log(`Email sent successfully`);

    return {
      result: { success: true } satisfies WorkflowSendEmailStepOutputSchema,
    };
  }
}
