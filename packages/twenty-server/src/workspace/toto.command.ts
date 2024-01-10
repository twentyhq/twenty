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
    const html = render(CleanInactiveWorkspaceEmail(), { pretty: true });
    const text = render(CleanInactiveWorkspaceEmail(), { plainText: true });

    await this.emailService.send({ to: 'martmull@hotmail.fr', html, text });
    //await this.emailService.send({ to: 'martmull@hotmail.fr', html, text });
  }
}
