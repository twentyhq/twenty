import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import {
  SendEmailActionException,
  SendEmailActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/exceptions/send-email-action.exception';
import { WorkflowSendEmailActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-input.type';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';
import { isDefined } from 'src/utils/is-defined';

export type WorkflowSendEmailStepOutputSchema = {
  success: boolean;
};

@Injectable()
export class SendEmailWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getEmailClient(connectedAccountId: string) {
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

  async execute(
    workflowActionInput: WorkflowSendEmailActionInput,
  ): Promise<WorkflowActionResult> {
    const emailProvider = await this.getEmailClient(
      workflowActionInput.connectedAccountId,
    );
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
