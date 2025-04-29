import { Module } from '@nestjs/common';

import { AutomatedTriggerService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/database-event-trigger.listener';

@Module({
  imports: [FeatureFlagModule],
  providers: [AutomatedTriggerService, DatabaseEventTriggerListener],
  exports: [AutomatedTriggerService],
})
export class AutomatedTriggerModule {}
