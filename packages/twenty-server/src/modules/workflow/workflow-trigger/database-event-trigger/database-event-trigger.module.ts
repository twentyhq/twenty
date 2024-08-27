import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DatabaseEventTriggerService } from 'src/modules/workflow/workflow-trigger/database-event-trigger/database-event-trigger.service';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/database-event-trigger/listeners/database-event-trigger.listener';

@Module({
  imports: [FeatureFlagModule],
  providers: [DatabaseEventTriggerService, DatabaseEventTriggerListener],
  exports: [DatabaseEventTriggerService],
})
export class DatabaseEventTriggerModule {}
