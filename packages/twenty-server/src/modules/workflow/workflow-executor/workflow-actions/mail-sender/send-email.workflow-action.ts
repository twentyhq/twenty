import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { isDefined, isValidUuid } from 'twenty-shared';
import { z } from 'zod';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
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
export class SendEmailWorkflowAction implements WorkflowExecutor {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getEmailClient(connectedAccountId: string) {
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

    switch (connectedAccount.provider) {
      case 'google':
        return await this.gmailClientProvider.getGmailClient(connectedAccount);
      default:
        throw new SendEmailActionException(
          `Provider ${connectedAccount.provider} is not supported`,
          SendEmailActionExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  async execute({
    currentStepIndex,
    steps,
    context,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps[currentStepIndex];

    if (!isWorkflowSendEmailAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send email action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const emailProvider = await this.getEmailClient(
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

    const message = [
      `To: ${email}`,
      `Subject: ${safeSubject || ''}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      safeBody,
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64');

    await emailProvider.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    this.logger.log(`Email sent successfully`);

    return {
      result: { success: true } satisfies WorkflowSendEmailStepOutputSchema,
    };
  }
}
