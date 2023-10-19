import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { UserSettingsService } from './user-settings.service';
import { UserSettingsResolver } from './user-settings.resolver';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [UserSettingsService, UserSettingsResolver],
})
export class UserSettingsModule {}
