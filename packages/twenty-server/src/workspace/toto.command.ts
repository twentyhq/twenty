import { Command, CommandRunner } from 'nest-commander';
import { render } from '@react-email/render';

import CleanInactiveWorkspaceEmail from 'src/workspace/emails/clean-inactive-workspace.email';
import { EmailJobService } from 'src/integrations/email/email-job.service';

@Command({
  name: 'test-send-email',
})
export class TotoCommand extends CommandRunner {
  constructor(private readonly emailJobService: EmailJobService) {
    super();
  }

  async run(): Promise<void> {
    const html = render(CleanInactiveWorkspaceEmail(), { pretty: true });
    const text = render(CleanInactiveWorkspaceEmail(), { plainText: true });

    await this.emailJobService.send({ to: 'martmull@hotmail.fr', html, text });
    //await this.emailService.send({ to: 'martmull@hotmail.fr', html, text });
  }
}
