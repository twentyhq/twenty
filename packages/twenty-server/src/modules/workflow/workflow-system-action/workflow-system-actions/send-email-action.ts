import { Injectable } from '@nestjs/common';

import { WorkflowActionEmail } from 'twenty-emails';
import { render } from '@react-email/components';

import { WorkflowSystemAction } from 'src/modules/workflow/workflow-system-action/workflow-system-action.interface';
import { WorkflowSystemStep } from 'src/modules/workflow/common/types/workflow-step.type';
import { WorkflowStepResult } from 'src/modules/workflow/common/types/workflow-step-result.type';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class SendEmailAction implements WorkflowSystemAction {
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
    let mainText = step.settings.template;

    if (isDefined(payload)) {
      Object.keys(payload).forEach(
        (key: string) =>
          (mainText = mainText?.replace(`{{${key}}}`, payload[key])),
      );
    }

    const email = WorkflowActionEmail({
      mainText: mainText,
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
      subject: step.settings.subject,
      text,
      html,
    });

    return { data: null };
  }
}
