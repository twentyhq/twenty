import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { RefreshAccessTokenCronJob } from 'src/modules/connected-account/crons/jobs/refresh-access-token.cron.job';

const REFRESH_ACCESS_TOKENS_CRON_PATTERN = '*/5 * * * *';

@Command({
  name: 'cron:connected-accounts:refresh-access-tokens',
  description:
    'Refreshes access tokens for all connected accounts that are supposed to be refreshed.',
})
export class RefreshAccessTokenCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      RefreshAccessTokenCronJob.name,
      undefined,
      {
        repeat: { pattern: REFRESH_ACCESS_TOKENS_CRON_PATTERN },
      },
    );
  }
}
