import { Injectable, Logger } from '@nestjs/common';

import { WorkflowActionEmail } from 'twenty-emails';
import { render } from '@react-email/components';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { z } from 'zod';

import { WorkflowSystemAction } from 'src/modules/workflow/workflow-system-action/workflow-system-action.interface';
import { WorkflowSystemStep } from 'src/modules/workflow/common/types/workflow-step.type';
import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class SendEmailAction implements WorkflowSystemAction {
  private readonly logger = new Logger(SendEmailAction.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    step,
    payload,
  }: {
    step: WorkflowSystemStep;
    payload: {
      email: string;
      [key: string]: string;
    };
  }): Promise<WorkflowStepResult> {
    const emailSchema = z.string().trim().email('Invalid email');

    const result = emailSchema.safeParse(payload.email);

    if (!result.success) {
      this.logger.warn(`Email '${payload.email}' invalid`);

      return { data: { success: false } };
    }

    let mainText = step.settings.template;

    if (isDefined(payload)) {
      Object.keys(payload).forEach(
        (key: string) =>
          (mainText = mainText?.replace(`{{${key}}}`, payload[key])),
      );
    }
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

    return { data: { success: true } };
  }
}
