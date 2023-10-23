import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/database/prisma.module';
import { AbilityModule } from 'src/ability/ability.module';

import { HookResolver } from './hook.resolver';

@Module({
  imports: [PrismaModule, AbilityModule],
  providers: [HookResolver],
})
export class HookModule {}
