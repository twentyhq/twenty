import { Command, CommandRunner } from 'nest-commander';
import { render } from '@react-email/render';

import CleanInactiveWorkspaceEmail from 'src/workspace/emails/clean-inactive-workspace.email';
import { EmailService } from 'src/integrations/email/email.service';

@Command({
  name: 'test-send-email',
})
export class TotoCommand extends CommandRunner {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async run(): Promise<void> {
    const emailData = {
      title: 'Inactive Workspace 😴',
      daysLeft: 10,
      userName: 'Martin Müller',
    };
    const html = render(CleanInactiveWorkspaceEmail(emailData), {
      pretty: true,
    });
    const text = render(CleanInactiveWorkspaceEmail(emailData), {
      plainText: true,
    });

    console.log(html);

    await this.emailService.send({ to: 'martmull@hotmail.fr', html, text });
    //await this.emailService.send({ to: 'martmull@hotmail.fr', html, text });
  }
}
