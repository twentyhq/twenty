import { Module } from '@nestjs/common';

import { AutomationService } from 'src/modules/automation-rule/services/automation.service';

@Module({
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationRuleModule {}
