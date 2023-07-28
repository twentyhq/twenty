import { Module } from '@nestjs/common';

import { ActivityResolver } from './resolvers/activity.resolver';
import { ActivityService } from './services/activity.service';
import { ActivityTargetService } from './services/activity-target.service';

@Module({
  providers: [ActivityResolver, ActivityService, ActivityTargetService],
  exports: [ActivityService, ActivityTargetService],
})
export class ActivityModule {}
