import { Injectable, Logger } from '@nestjs/common';

import { z } from 'zod';
import Handlebars from 'handlebars';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowSendEmailStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  MailSenderException,
  MailSenderExceptionCode,
} from 'src/modules/mail-sender/exceptions/mail-sender.exception';
import { GmailClientProvider } from 'src/modules/messaging/message-import-manager/drivers/gmail/providers/gmail-client.provider';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class SendEmailWorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getEmailClient(step: WorkflowSendEmailStep) {
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
      id: step.settings.connectedAccountId,
    });

    if (!isDefined(connectedAccount)) {
      throw new MailSenderException(
        `Connected Account '${step.settings.connectedAccountId}' not found`,
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

  async execute({
    step,
    payload,
  }: {
    step: WorkflowSendEmailStep;
    payload: {
      email: string;
      [key: string]: string;
    };
  }): Promise<WorkflowActionResult> {
    const emailProvider = await this.getEmailClient(step);

    try {
      const emailSchema = z.string().trim().email('Invalid email');

      const result = emailSchema.safeParse(payload.email);

      if (!result.success) {
        this.logger.warn(`Email '${payload.email}' invalid`);

        return { result: { success: false } };
      }

      const body = Handlebars.compile(step.settings.body)(payload);
      const subject = Handlebars.compile(step.settings.subject)(payload);

      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      const safeBody = purify.sanitize(body || '');
      const safeSubject = purify.sanitize(subject || '');

      const message = [
        `To: ${payload.email}`,
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
