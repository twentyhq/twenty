import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/database/prisma.module';
import { AbilityModule } from 'src/ability/ability.module';
import { WebHookResolver } from 'src/core/web-hook/web-hook.resolver';

@Module({
  imports: [PrismaModule, AbilityModule],
  providers: [WebHookResolver],
})
export class WebHookModule {}
