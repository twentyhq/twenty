import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/listeners/database-event-trigger.listener';

@Module({
  imports: [FeatureFlagModule],
  providers: [DatabaseEventTriggerListener],
})
export class WorkflowTriggerListenerModule {}
