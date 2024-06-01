import { Module } from '@nestjs/common';

import { RefreshAccessTokenCronCommand } from 'src/modules/connected-account/crons/commands/refresh-access-token-cron-commands.cron.command';

@Module({
  providers: [RefreshAccessTokenCronCommand],
})
export class RefreshAccessTokenCronCommandsModule {}
