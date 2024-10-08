import { Injectable, Logger } from '@nestjs/common';

import { z } from 'zod';
import Handlebars from 'handlebars';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowSendEmailStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
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

@Injectable()
export class SendEmailWorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  private async getEmailClient(step: WorkflowSendEmailStep) {
    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    const connectedAccount =
      await this.connectedAccountRepository.getByIdOrFail(
        step.settings.connectedAccountId,
        workspaceId,
      );

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

      return { result: { success: true } };
    } catch (error) {
      return { error };
    }
  }
}
