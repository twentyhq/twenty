import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { ActivityResolver } from './resolvers/activity.resolver';
import { ActivityService } from './services/activity.service';
import { ActivityTargetService } from './services/activity-target.service';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [ActivityResolver, ActivityService, ActivityTargetService],
  exports: [ActivityService, ActivityTargetService],
})
export class ActivityModule {}
