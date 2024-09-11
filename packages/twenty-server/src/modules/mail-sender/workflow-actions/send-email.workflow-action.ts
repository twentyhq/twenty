import { Injectable, Logger } from '@nestjs/common';

import { z } from 'zod';
import Handlebars from 'handlebars';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { WorkflowActionEmail } from 'twenty-emails';
import { render } from '@react-email/components';

import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';
import { WorkflowSendEmailStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';

@Injectable()
export class SendEmailWorkflowAction {
  private readonly logger = new Logger(SendEmailWorkflowAction.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
  ) {}

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
    try {
      const emailSchema = z.string().trim().email('Invalid email');

      const result = emailSchema.safeParse(payload.email);

      if (!result.success) {
        this.logger.warn(`Email '${payload.email}' invalid`);

        return { result: { success: false } };
      }

      const mainText = Handlebars.compile(step.settings.template)(payload);

      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      const safeHTML = purify.sanitize(mainText || '');

      const email = WorkflowActionEmail({
        dangerousHTML: safeHTML,
        title: step.settings.title,
        callToAction: step.settings.callToAction,
      });
      const html = render(email, {
        pretty: true,
      });
      const text = render(email, {
        plainText: true,
      });

      await this.emailService.send({
        from: `${this.environmentService.get(
          'EMAIL_FROM_NAME',
        )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
        to: payload.email,
        subject: step.settings.subject || '',
        text,
        html,
      });

      return { result: { success: true } };
    } catch (error) {
      return { error };
    }
  }
}
