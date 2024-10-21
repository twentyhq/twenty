import { Injectable, Logger } from '@nestjs/common';

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MailSenderException,
  MailSenderExceptionCode,
} from 'src/modules/mail-sender/exceptions/mail-sender.exception';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowSendEmailStepInput } from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';
import { isDefined } from 'src/utils/is-defined';

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
      throw new MailSenderException(
        `Connected Account '${connectedAccountId}' not found`,
        MailSenderExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    switch (connectedAccount.provider) {
      case 'google':
        return await this.gmailClientProvider.getGmailClient(connectedAccount);
      default:
        throw new MailSenderException(
          `Provider ${connectedAccount.provider} is not supported`,
          MailSenderExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }

  async execute(
    workflowStepInput: WorkflowSendEmailStepInput,
  ): Promise<WorkflowActionResult> {
    const emailProvider = await this.getEmailClient(
      workflowStepInput.connectedAccountId,
    );
    const { email, body, subject } = workflowStepInput;

    try {
      const emailSchema = z.string().trim().email('Invalid email');

      const result = emailSchema.safeParse(email);

      if (!result.success) {
        this.logger.warn(`Email '${email}' invalid`);

        return { result: { success: false } };
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

      return { result: { success: true } };
    } catch (error) {
      return { error };
    }
  }
}
